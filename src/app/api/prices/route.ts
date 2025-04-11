import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Price from '@/models/Price';

// GET: Retrieve all prices or a specific price
export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const classType = searchParams.get('classType');
    const duration = searchParams.get('duration');
    const packageType = searchParams.get('package');
    
    // Build query based on parameters
    const query: any = {};
    
    if (classType) {
      query.classType = classType;
    }
    
    if (duration) {
      query.duration = parseInt(duration);
    }
    
    if (packageType) {
      query.package = packageType;
    }
    
    // Get prices based on query
    const prices = await Price.find(query).sort({ classType: 1, duration: 1, package: 1 });
    
    return NextResponse.json({ prices });
  } catch (error) {
    console.error('Error fetching prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}

// POST: Create a new price
export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const body = await request.json();
    const { classType, duration, package: packageType, price } = body;
    
    // Validate required fields
    if (!classType || !packageType || price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if price already exists
    const existingPrice = await Price.findOne({
      classType,
      duration,
      package: packageType
    });
    
    if (existingPrice) {
      return NextResponse.json(
        { error: 'Price already exists for this combination' },
        { status: 400 }
      );
    }
    
    // Create a new price
    const newPrice = await Price.create({
      classType,
      duration,
      package: packageType,
      price
    });
    
    return NextResponse.json({ price: newPrice });
  } catch (error) {
    console.error('Error creating price:', error);
    return NextResponse.json(
      { error: 'Failed to create price' },
      { status: 500 }
    );
  }
}

// PUT: Update an existing price
export async function PUT(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Get priceId from query params
    const { searchParams } = new URL(request.url);
    const priceId = searchParams.get('priceId');
    
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    const { classType, duration, package: packageType, price } = body;
    
    // Validate required fields
    if (price === undefined) {
      return NextResponse.json(
        { error: 'Price value is required' },
        { status: 400 }
      );
    }
    
    // Check if price exists
    const existingPrice = await Price.findById(priceId);
    
    if (!existingPrice) {
      return NextResponse.json(
        { error: 'Price not found' },
        { status: 404 }
      );
    }
    
    // Update all fields if provided
    if (classType) existingPrice.classType = classType;
    if (duration) existingPrice.duration = duration;
    if (packageType) existingPrice.package = packageType;
    existingPrice.price = price;
    
    await existingPrice.save();
    
    return NextResponse.json({ price: existingPrice });
  } catch (error) {
    console.error('Error updating price:', error);
    return NextResponse.json(
      { error: 'Failed to update price' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a price
export async function DELETE(request: NextRequest) {
  try {
    
    // Connect to the database
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const priceId = searchParams.get('priceId');
    
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }
    
    // Check if price exists
    const existingPrice = await Price.findById(priceId);
    
    if (!existingPrice) {
      return NextResponse.json(
        { error: 'Price not found' },
        { status: 404 }
      );
    }
    
    // Delete price
    await Price.findByIdAndDelete(priceId);
    
    return NextResponse.json({ 
      message: 'Price deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting price:', error);
    return NextResponse.json(
      { error: 'Failed to delete price' },
      { status: 500 }
    );
  }
}