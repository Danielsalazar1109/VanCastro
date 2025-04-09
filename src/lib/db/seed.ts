import connectToDatabase from './mongodb';
import Location from '@/models/Location';
import ClassType from '@/models/ClassType';

/**
 * Seeds the database with initial data for locations and class types.
 * This should be run once when setting up the application.
 */
export async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Connected to database');

    // Seed locations
    console.log('Seeding locations...');
    const locations = [
      { name: 'Vancouver, 999 Kingsway' },
      { name: 'Vancouver, 4126 McDonald St' },
      { name: 'Burnaby, 3880 Lougheed Hwy' },
      { name: 'Burnaby, 4399 Wayburne Dr' },
      { name: 'North Vancouver, 1331 Marine Drive' }
    ];

    for (const location of locations) {
      // Check if location already exists
      const existingLocation = await Location.findOne({ name: location.name });
      
      if (!existingLocation) {
        await Location.create(location);
        console.log(`Created location: ${location.name}`);
      } else if (!existingLocation.isActive) {
        // If location exists but is inactive, reactivate it
        existingLocation.isActive = true;
        await existingLocation.save();
        console.log(`Reactivated location: ${location.name}`);
      } else {
        console.log(`Location already exists: ${location.name}`);
      }
    }

    // Seed class types
    console.log('Seeding class types...');
    const classTypes = [
      { name: 'class 4' },
      { name: 'class 5' },
      { name: 'class 7' }
    ];

    for (const classType of classTypes) {
      // Check if class type already exists
      const existingClassType = await ClassType.findOne({ name: classType.name });
      
      if (!existingClassType) {
        await ClassType.create(classType);
        console.log(`Created class type: ${classType.name}`);
      } else if (!existingClassType.isActive) {
        // If class type exists but is inactive, reactivate it
        existingClassType.isActive = true;
        await existingClassType.save();
        console.log(`Reactivated class type: ${classType.name}`);
      } else {
        console.log(`Class type already exists: ${classType.name}`);
      }
    }

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// If this script is run directly (not imported)
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed, exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}