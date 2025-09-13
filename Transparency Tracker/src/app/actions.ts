'use server';

import { summarizeReports } from '@/ai/flows/summarize-reports';
import type { Report } from '@/lib/definitions';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import fs from 'fs/promises';
import path from 'path';

const summarySchema = z.object({
  summary: z.string(),
});


export async function generateSummaryAction(reports: Report[]): Promise<{ summary: string; error?: string }> {
  if (reports.length === 0) {
    return { summary: 'সারাংশ করার জন্য কোনো রিপোর্ট নির্বাচন করা হয়নি।' };
  }

  const reportsString = reports
    .map(
      (report) =>
        `Date: ${report.date}, Division: ${report.division}, District: ${report.district}, Category: ${report.category}, Description: ${report.description}`
    )
    .join('\n\n');

  try {
    const result = await summarizeReports({ reports: reportsString });
    
    // This is a safer way to parse the AI output.
    // It will not throw an error if the format is incorrect.
    const parsedResult = summarySchema.safeParse(result);

    if (parsedResult.success) {
      return { summary: parsedResult.data.summary };
    }
     
    // If parsing fails, log the error and return a user-friendly message
    // without crashing the server.
    console.error("Invalid format from AI:", parsedResult.error);
    return { summary: "জেনারেটেড সারাংশ একটি অপ্রত্যাশিত বিন্যাসে রয়েছে।", error: "Invalid format from AI" };

  } catch (error) {
    console.error('Error generating summary:', error);
    return { summary: 'সারাংশ তৈরিতে একটি ত্রুটি হয়েছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।', error: 'API call failed' };
  }
}

const ReportSchema = z.object({
  division: z.string().min(1, { message: 'বিভাগ নির্বাচন আবশ্যক।' }),
  district: z.string().min(1, { message: 'জেলা নির্বাচন আবশ্যক। ' }),
  category: z.string().min(1, { message: 'ক্যাটাগরি নির্বাচন আবশ্যক।' }),
  description: z.string().min(1, { message: 'বিবরণ আবশ্যক।' }),
  date: z.string().min(1, { message: 'তারিখ আবশ্যক।' }),
});

const reportsPath = path.join(process.cwd(), 'src', 'lib', 'reports.json');

async function readReports(): Promise<Report[]> {
    try {
      const fileContent = await fs.readFile(reportsPath, 'utf-8');
      const reports = JSON.parse(fileContent);
      // Sort reports by ID descending to show newest first
      return reports.sort((a,b) => b.id - a.id);
    } catch (error) {
      // File might not exist yet, so we return an empty list.
      return [];
    }
}

export async function getReportsAction(): Promise<Report[]> {
    return readReports();
}

export async function createReportAction(
  prevState: { message: string | object, success: boolean },
  formData: FormData
) {
  const validatedFields = ReportSchema.safeParse({
    division: formData.get('division'),
    district: formData.get('district'),
    category: formData.get('category'),
    description: formData.get('description'),
    date: formData.get('date'),
  });

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const reports: Report[] = await readReports();

    const newReport: Report = {
      id: reports.length > 0 ? Math.max(...reports.map(r => r.id)) + 1 : 1,
      ...validatedFields.data,
    };

    reports.unshift(newReport);

    await fs.writeFile(reportsPath, JSON.stringify(reports, null, 2), 'utf-8');

  } catch (error) {
    console.error(error);
    return { message: 'রিপোর্ট জমা দিতে ব্যর্থ হয়েছে। সার্ভার ত্রুটি।', success: false };
  }

  redirect('/dashboard');
}
