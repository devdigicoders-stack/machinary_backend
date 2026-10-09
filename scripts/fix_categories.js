import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Category } from '../src/models/Category.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  await Category.updateMany(
    { name: { $in: ['Concrete Equipment', 'Generators', 'Earthmoving & Excavation (Rent)', 'Cranes & Lifting Equipment (Rent)'] } },
    { $set: { categoryType: 'rent' } }
  );

  await Category.updateMany(
    { name: { $in: ['Used Heavy Earthmovers (Buy/Sell)', 'Road Construction & Rollers (Buy/Sell)'] } },
    { $set: { categoryType: 'sell' } }
  );

  await Category.updateMany(
    { name: { $in: ['Heavy Low-Bed Trailers & Pullers', 'Tippers, Dumpers & Transit Mixers'] } },
    { $set: { categoryType: 'transport' } }
  );

  await Category.updateMany(
    { name: { $in: ['Building & Structural Material', 'Aggregates & Mining Sands'] } },
    { $set: { categoryType: 'material' } }
  );

  const rentCount = await Category.countDocuments({ categoryType: 'rent' });
  const sellCount = await Category.countDocuments({ categoryType: 'sell' });
  const transCount = await Category.countDocuments({ categoryType: 'transport' });
  const matCount = await Category.countDocuments({ categoryType: 'material' });

  console.log({ rentCount, sellCount, transCount, matCount });

  const all = await Category.find({}, 'name categoryType');
  console.log('Categories:', all);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
