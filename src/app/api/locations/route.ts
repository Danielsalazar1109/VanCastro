import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Location from '@/models/Location';
import Instructor from '@/models/Instructor';

export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';
    
    // Build query based on parameters
    const query: any = {};
    
    if (activeOnly) {
      query.isActive = true;
    }
    
    // Get locations based on query
    const locations = await Location.find(query).sort({ name: 1 });
    
    return NextResponse.json({ locations });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const body = await request.json();
    const { name } = body;
    
    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Location name is required' },
        { status: 400 }
      );
    }
    
    // Check if location already exists
    const existingLocation = await Location.findOne({ name });
    
    if (existingLocation) {
      // If location exists but is inactive, reactivate it
      if (!existingLocation.isActive) {
        existingLocation.isActive = true;
        await existingLocation.save();
        return NextResponse.json({ location: existingLocation });
      }
      
      return NextResponse.json(
        { error: 'Location with this name already exists' },
        { status: 409 }
      );
    }
    
    // Create new location
    const location = await Location.create({
      name,
      isActive: true
    });
    
    // No need to invalidate cache - instructors now fetch locations directly from the database
    
    return NextResponse.json({ location });
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      { error: 'Failed to create location' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const body = await request.json();
    const { locationId, name, isActive } = body;
    
    // Validate required fields
    if (!locationId) {
      return NextResponse.json(
        { error: 'Location ID is required' },
        { status: 400 }
      );
    }
    
    // Check if location exists
    const location = await Location.findById(locationId);
    
    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }
    
    // Update location fields if provided
    if (name !== undefined) location.name = name;
    if (isActive !== undefined) location.isActive = isActive;
    
    await location.save();
    
    // No need to invalidate cache - instructors now fetch locations directly from the database
    
    return NextResponse.json({ location });
  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');
    const hardDelete = searchParams.get('hardDelete') === 'true';
    
    if (!locationId) {
      return NextResponse.json(
        { error: 'Location ID is required' },
        { status: 400 }
      );
    }
    
    // Check if location exists
    const location = await Location.findById(locationId);
    
    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }
    
    // Check if any instructors are using this location
    if (hardDelete) {
      // Check if any instructors are using this location before hard delete
      const instructors = await Instructor.find();
      
      // We need to check each instructor's locations which is a virtual property
      for (const instructor of instructors) {
        // Cast instructor to a type that includes the virtual property
        const instructorDoc = instructor as unknown as { 
          locations: Promise<string[]>;
        };
        
        // Get the instructor's locations
        const instructorLocations = await instructorDoc.locations;
        
        // Check if the instructor is available at the specified location
        if (instructorLocations.includes(location.name)) {
          return NextResponse.json(
            { error: 'Cannot delete location that is being used by instructors' },
            { status: 400 }
          );
        }
      }
      
      // Perform hard delete - actually remove from database
      await Location.findByIdAndDelete(locationId);
      return NextResponse.json({ message: 'Location deleted successfully' });
    } else {
      // Soft delete by setting isActive to false
      location.isActive = false;
      await location.save();
      return NextResponse.json({ message: 'Location deactivated successfully' });
    }
  } catch (error) {
    console.error('Error deactivating location:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate location' },
      { status: 500 }
    );
  }
}