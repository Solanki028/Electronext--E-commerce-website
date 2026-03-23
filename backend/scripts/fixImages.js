import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import Product from '../src/models/Product.model.js';

const BAD_URL = 'https://images.unsplash.com/photo-1556910103-1c02745a8e63?q=80&w=1000&auto=format&fit=crop';
const GOOD_URL = 'https://images.unsplash.com/photo-1540638349517-3abd5afc5b70?q=80&w=1000&auto=format&fit=crop';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('Connection error:', error);
        process.exit(1);
    }
};

const run = async () => {
    await connectDB();
    const products = await Product.find({ 'images.url': BAD_URL });
    for (let product of products) {
        let changed = false;
        product.images.forEach(img => {
            if (img.url === BAD_URL) {
                img.url = GOOD_URL;
                changed = true;
            }
        });
        if (changed) {
            await product.save();
            console.log('Updated product:', product.name);
        }
    }
    console.log('Done!');
    mongoose.connection.close();
};

run();
