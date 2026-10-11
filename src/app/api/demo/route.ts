import { NextResponse } from "next/server";
import { createDemoState } from "@/features/budget/data/demo";

export async function POST() {
  return NextResponse.json(createDemoState());
}
