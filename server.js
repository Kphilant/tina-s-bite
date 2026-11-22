const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// PostgreSQL database connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'tinas_bite_db',
  password: '123', // <--- Update this line
  port: 5432,
});


const TINA_MOMO_NUMBER = '0551011153';

// API Endpoint to Receive Orders from the Website
app.post('/api/orders', async (req, res) => {
  const { customerName, customerPhone, zoneId, exactAddress, paymentProvider, itemsTotal, deliveryFee, grandTotal, items } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insert order into PostgreSQL
    const orderQuery = `
      INSERT INTO orders (customer_name, customer_phone, delivery_zone_id, exact_address, payment_provider, receiving_momo_number, items_total, delivery_fee, grand_total, payment_status, order_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Pending', 'Received')
      RETURNING id;
    `;
    const orderValues = [customerName, customerPhone, zoneId || 1, exactAddress, paymentProvider, TINA_MOMO_NUMBER, itemsTotal, deliveryFee, grandTotal];
    const orderResult = await client.query(orderQuery, orderValues);
    const orderId = orderResult.rows[0].id;

    // 2. Insert items into order_items table
    for (let item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price) VALUES ($1, $2, $3, $4)`,
        [orderId, item.id, item.quantity, item.price]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Order recorded successfully in database!',
      orderId: orderId
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database error:', error);
    res.status(500).json({ success: false, error: 'Failed to save order.' });
  } finally {
    client.release();
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Tina's Bite Launch Server running on http://localhost:${PORT}`);
});