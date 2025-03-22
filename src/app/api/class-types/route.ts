import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import ClassType from '@/models/ClassType';

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
    
    // Get class types based on query
    const classTypes = await ClassType.find(query).sort({ name: 1 });
    
    return NextResponse.json({ classTypes });
  } catch (error) {
    console.error('Error fetching class types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch class types' },
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
        { error: 'Class type name is required' },
        { status: 400 }
      );
    }
    
    // Check if class type already exists
    const existingClassType = await ClassType.findOne({ name });
    
    if (existingClassType) {
      // If class type exists but is inactive, reactivate it
      if (!existingClassType.isActive) {
        existingClassType.isActive = true;
        await existingClassType.save();
        return NextResponse.json({ classType: existingClassType });
      }
      
      return NextResponse.json(
        { error: 'Class type with this name already exists' },
        { status: 409 }
      );
    }
    
    // Create new class type
    const classType = await ClassType.create({
      name,
      isActive: true
    });
    
    return NextResponse.json({ classType });
  } catch (error) {
    console.error('Error creating class type:', error);
    return NextResponse.json(
      { error: 'Failed to create class type' },
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
    const { classTypeId, name, isActive } = body;
    
    // Validate required fields
    if (!classTypeId) {
      return NextResponse.json(
        { error: 'Class type ID is required' },
        { status: 400 }
      );
    }
    
    // Check if class type exists
    const classType = await ClassType.findById(classTypeId);
    
    if (!classType) {
      return NextResponse.json(
        { error: 'Class type not found' },
        { status: 404 }
      );
    }
    
    // Update class type fields if provided
    if (name !== undefined) classType.name = name;
    if (isActive !== undefined) classType.isActive = isActive;
    
    await classType.save();
    
    return NextResponse.json({ classType });
  } catch (error) {
    console.error('Error updating class type:', error);
    return NextResponse.json(
      { error: 'Failed to update class type' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const classTypeId = searchParams.get('classTypeId');
    
    if (!classTypeId) {
      return NextResponse.json(
        { error: 'Class type ID is required' },
        { status: 400 }
      );
    }
    
    // Check if class type exists
    const classType = await ClassType.findById(classTypeId);
    
    if (!classType) {
      return NextResponse.json(
        { error: 'Class type not found' },
        { status: 404 }
      );
    }
    
    // Soft delete by setting isActive to false
    classType.isActive = false;
    await classType.save();
    
    return NextResponse.json({ message: 'Class type deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating class type:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate class type' },
      { status: 500 }
    );
  }
}