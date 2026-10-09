import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Customer } from '../src/models/Customer.js';
import { Owner } from '../src/models/Owner.js';

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const customers = await Customer.find({});
  console.log('Total Customers:', customers.length);
  customers.forEach(c => {
    console.log(`Cust: ${c.name} | Phone: ${c.phone} | FCM: ${c.fcmToken ? c.fcmToken.substring(0, 25) + '...' : 'EMPTY'}`);
  });

  const owners = await Owner.find({});
  console.log('Total Owners:', owners.length);
  owners.forEach(o => {
    console.log(`Owner: ${o.name} | Phone: ${o.phone} | FCM: ${o.fcmToken ? o.fcmToken.substring(0, 25) + '...' : 'EMPTY'}`);
  });

  process.exit(0);
}

check().catch(e => {
  console.error(e);
  process.exit(1);
});
