import connectToDatabase from './mongodb';
import ClassType from '@/models/ClassType';

/**
 * Seeds the database with initial data for class types.
 * Locations are now managed through the admin panel and no longer need to be seeded.
 * This should be run once when setting up the application.
 */
export async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Connected to database');

    // Note: Locations are now managed through the admin panel
    // and are no longer seeded here

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