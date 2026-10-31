import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Transaction } from '@/types/finance';
import { INITIAL_TRANSACTIONS } from '@/lib/storage';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'finmech_db.json');

function ensureDb(): Transaction[] {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_TRANSACTIONS, null, 2), 'utf-8');
      return INITIAL_TRANSACTIONS;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error accessing local db:', e);
    return INITIAL_TRANSACTIONS;
  }
}

export async function GET() {
  const transactions = ensureDb();
  return NextResponse.json({ transactions });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let current = ensureDb();

    if (Array.isArray(body.transactions)) {
      // Bulk sync
      current = body.transactions;
    } else if (body.transaction) {
      // Single add
      current = [body.transaction, ...current];
    }

    fs.writeFileSync(DB_FILE, JSON.stringify(current, null, 2), 'utf-8');
    return NextResponse.json({ success: true, count: current.length });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update db' }, { status: 500 });
  }
}

