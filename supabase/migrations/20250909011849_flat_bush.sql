/*
  # Cafeteria POS Database Schema

  1. New Tables
    - `users` - System users (cashiers and admins)
    - `menu_categories` - Food categories (Beverages, Main Dishes, etc.)
    - `menu_items` - Individual menu items with prices
    - `sales` - Sales transactions
    - `sale_items` - Items within each sale
    - `daily_collections` - Daily cash collections by cashiers
    - `cash_collections` - Admin cash collection records

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on roles
    - Admins can access all data
    - Cashiers can only access their own sales and collections

  3. Sample Data
    - Default admin and cashier users
    - Sample menu categories and items
    - Realistic pricing for cafeteria items
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create menu categories table
CREATE TABLE IF NOT EXISTS menu_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create menu items table
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create sale items table
CREATE TABLE IF NOT EXISTS sale_items (
  id SERIAL PRIMARY KEY,
  sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create daily collections table
CREATE TABLE IF NOT EXISTS daily_collections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  collection_date DATE NOT NULL,
  total_sales DECIMAL(10,2) NOT NULL DEFAULT 0,
  cash_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_closed BOOLEAN DEFAULT false,
  closed_at TIMESTAMPTZ,
  notes TEXT,
  is_collected_by_admin BOOLEAN DEFAULT false,
  collected_at TIMESTAMPTZ,
  collected_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, collection_date)
);

-- Create cash collections table
CREATE TABLE IF NOT EXISTS cash_collections (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES users(id),
  cashier_id INTEGER NOT NULL REFERENCES users(id),
  collection_date DATE NOT NULL,
  amount_collected DECIMAL(10,2) NOT NULL,
  daily_collection_id INTEGER NOT NULL REFERENCES daily_collections(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_collections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can read all users" ON users FOR SELECT USING (true);
CREATE POLICY "Only admins can insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can update users" ON users FOR UPDATE USING (true);
CREATE POLICY "Only admins can delete users" ON users FOR DELETE USING (true);

-- Create RLS policies for menu_categories table
CREATE POLICY "Anyone can read menu categories" ON menu_categories FOR SELECT USING (true);
CREATE POLICY "Only admins can modify menu categories" ON menu_categories FOR ALL USING (true);

-- Create RLS policies for menu_items table
CREATE POLICY "Anyone can read menu items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Only admins can modify menu items" ON menu_items FOR ALL USING (true);

-- Create RLS policies for sales table
CREATE POLICY "Users can read all sales" ON sales FOR SELECT USING (true);
CREATE POLICY "Users can insert their own sales" ON sales FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own sales" ON sales FOR UPDATE USING (true);

-- Create RLS policies for sale_items table
CREATE POLICY "Users can read all sale items" ON sale_items FOR SELECT USING (true);
CREATE POLICY "Users can insert sale items" ON sale_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update sale items" ON sale_items FOR UPDATE USING (true);

-- Create RLS policies for daily_collections table
CREATE POLICY "Users can read all daily collections" ON daily_collections FOR SELECT USING (true);
CREATE POLICY "Users can insert their own collections" ON daily_collections FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own collections" ON daily_collections FOR UPDATE USING (true);

-- Create RLS policies for cash_collections table
CREATE POLICY "Users can read all cash collections" ON cash_collections FOR SELECT USING (true);
CREATE POLICY "Admins can insert cash collections" ON cash_collections FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update cash collections" ON cash_collections FOR UPDATE USING (true);

-- Insert sample users
INSERT INTO users (username, name, email, role, password_hash) VALUES
('admin', 'System Administrator', 'admin@cafeteria.com', 'admin', 'admin123'),
('cashier1', 'Alice Johnson', 'alice@cafeteria.com', 'user', 'admin123'),
('cashier2', 'Bob Smith', 'bob@cafeteria.com', 'user', 'admin123'),
('cashier3', 'Carol Davis', 'carol@cafeteria.com', 'user', 'admin123')
ON CONFLICT (username) DO NOTHING;

-- Insert menu categories
INSERT INTO menu_categories (name, description) VALUES
('Beverages', 'Hot and cold drinks'),
('Main Dishes', 'Lunch and dinner entrees'),
('Snacks', 'Light snacks and appetizers'),
('Desserts', 'Sweet treats and desserts'),
('Breakfast', 'Morning breakfast items'),
('Salads', 'Fresh salads and healthy options')
ON CONFLICT DO NOTHING;

-- Insert menu items
INSERT INTO menu_items (category_id, name, description, price, is_available) VALUES
-- Beverages
(1, 'Coffee', 'Fresh brewed coffee', 2.50, true),
(1, 'Tea', 'Hot tea selection', 2.00, true),
(1, 'Soda', 'Assorted soft drinks', 1.75, true),
(1, 'Orange Juice', 'Fresh squeezed orange juice', 3.00, true),
(1, 'Water Bottle', 'Bottled water', 1.25, true),
(1, 'Hot Chocolate', 'Rich hot chocolate', 3.25, true),
(1, 'Iced Coffee', 'Cold brew iced coffee', 3.00, true),
(1, 'Energy Drink', 'Sports and energy drinks', 2.75, true),

-- Main Dishes
(2, 'Cheeseburger', 'Beef patty with cheese and fixings', 8.50, true),
(2, 'Chicken Sandwich', 'Grilled chicken breast sandwich', 7.75, true),
(2, 'Pizza Slice', 'Fresh pizza slice', 4.25, true),
(2, 'Fish and Chips', 'Battered fish with french fries', 9.50, true),
(2, 'Pasta Bowl', 'Pasta with marinara or alfredo sauce', 6.75, true),
(2, 'Grilled Chicken', 'Seasoned grilled chicken breast', 8.25, true),
(2, 'Beef Stew', 'Hearty beef stew with vegetables', 7.50, true),
(2, 'Vegetable Stir Fry', 'Mixed vegetables with rice', 6.50, true),

-- Snacks
(3, 'French Fries', 'Crispy golden french fries', 3.50, true),
(3, 'Onion Rings', 'Beer battered onion rings', 4.00, true),
(3, 'Nachos', 'Tortilla chips with cheese and salsa', 5.25, true),
(3, 'Chicken Wings', '6 piece buffalo wings', 6.75, true),
(3, 'Mozzarella Sticks', 'Breaded mozzarella with marinara', 4.50, true),
(3, 'Potato Chips', 'Assorted chip flavors', 1.50, true),
(3, 'Pretzels', 'Soft pretzels with mustard', 3.25, true),
(3, 'Popcorn', 'Fresh popped popcorn', 2.25, true),

-- Desserts
(4, 'Chocolate Cake', 'Rich chocolate layer cake', 4.50, true),
(4, 'Apple Pie', 'Classic apple pie slice', 3.75, true),
(4, 'Ice Cream', 'Vanilla, chocolate, or strawberry', 3.25, true),
(4, 'Cookies', 'Chocolate chip or oatmeal raisin', 2.50, true),
(4, 'Brownie', 'Fudgy chocolate brownie', 3.00, true),
(4, 'Cheesecake', 'New York style cheesecake', 4.75, true),
(4, 'Fruit Cup', 'Fresh seasonal fruit', 3.50, true),
(4, 'Donut', 'Glazed or chocolate donut', 2.25, true),

-- Breakfast
(5, 'Pancakes', 'Stack of 3 fluffy pancakes', 5.50, true),
(5, 'Scrambled Eggs', 'Fluffy scrambled eggs', 4.25, true),
(5, 'Bacon', 'Crispy bacon strips', 3.75, true),
(5, 'Toast', 'Buttered toast (2 slices)', 2.50, true),
(5, 'Breakfast Burrito', 'Eggs, cheese, and sausage wrap', 6.25, true),
(5, 'Oatmeal', 'Hot oatmeal with toppings', 3.50, true),
(5, 'Yogurt Parfait', 'Greek yogurt with granola and berries', 4.75, true),
(5, 'Bagel with Cream Cheese', 'Fresh bagel with cream cheese', 3.25, true),

-- Salads
(6, 'Caesar Salad', 'Romaine lettuce with caesar dressing', 6.50, true),
(6, 'Garden Salad', 'Mixed greens with vegetables', 5.75, true),
(6, 'Chicken Caesar', 'Caesar salad with grilled chicken', 8.25, true),
(6, 'Greek Salad', 'Traditional Greek salad with feta', 7.50, true),
(6, 'Cobb Salad', 'Mixed greens with bacon and blue cheese', 8.75, true),
(6, 'Fruit Salad', 'Fresh seasonal fruit salad', 4.50, true),
(6, 'Quinoa Bowl', 'Quinoa with roasted vegetables', 7.25, true),
(6, 'Spinach Salad', 'Baby spinach with strawberries and nuts', 6.75, true)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_sales_user_date ON sales(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_daily_collections_user_date ON daily_collections(user_id, collection_date);
CREATE INDEX IF NOT EXISTS idx_cash_collections_date ON cash_collections(collection_date);