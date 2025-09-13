'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { divisionDistricts, categories } from '@/lib/data';
import { createReportAction } from '../actions';
import { useRouter } from 'next/navigation';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'জমা দেওয়া হচ্ছে...' : 'রিপোর্ট জমা দিন'}
    </Button>
  );
}

export default function ReportPage() {
  const initialState = { message: {}, success: false };
  const [state, dispatch] = useFormState(createReportAction, initialState);
  const router = useRouter();

  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [formKey, setFormKey] = useState(Date.now());
  
  const availableDistricts = useMemo(() => {
    if (!selectedDivision) return [];
    return divisionDistricts[selectedDivision] || [];
  }, [selectedDivision]);

  useEffect(() => {
    if (state.success) {
        setFormKey(Date.now()); // Reset form by changing key
        setSelectedDivision('');
        setSelectedDistrict('');
    }
  }, [state.success, router]);
  
  useEffect(() => {
    document.title = "Transparency Tracker - রিপোর্ট জমা দিন";
  }, []);
  
  useEffect(() => {
    // Reset district when division changes
    setSelectedDistrict('');
  }, [selectedDivision]);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <main className="w-full max-w-2xl">
        <Card className="bg-background/90 rounded-xl shadow-2xl backdrop-blur-sm">
          <CardHeader>
            <div className="flex justify-between items-center mb-4">
              <CardTitle className="text-2xl font-bold text-gray-800">দুর্নীতি রিপোর্ট ফর্ম</CardTitle>
              <Button asChild variant="outline">
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  ড্যাশবোর্ডে ফিরে যান
                </Link>
              </Button>
            </div>
            <CardDescription>নিচের ফর্মটি পূরণ করে দুর্নীতির রিপোর্ট জমা দিন। আপনার পরিচয় গোপন রাখা হবে।</CardDescription>
          </CardHeader>
          <CardContent>
            <form key={formKey} action={dispatch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="division">বিভাগ</Label>
                   <Select name="division" required onValueChange={setSelectedDivision} value={selectedDivision}>
                    <SelectTrigger>
                      <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(divisionDistricts).map((div) => (
                        <SelectItem key={div} value={div}>{div}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">জেলা</Label>
                  <Select name="district" required disabled={!selectedDivision} value={selectedDistrict} onValueChange={setSelectedDistrict}>
                    <SelectTrigger>
                      <SelectValue placeholder={!selectedDivision ? "প্রথমে বিভাগ নির্বাচন করুন" : "জেলা নির্বাচন করুন"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDistricts.map((dis) => (
                        <SelectItem key={dis} value={dis}>{dis}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">ক্যাটাগরি</Label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">তারিখ</Label>
                <Input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">বিবরণ</Label>
                <Textarea
                  name="description"
                  placeholder="দুর্নীতির বিস্তারিত বিবরণ লিখুন..."
                  required
                  rows={5}
                />
              </div>
              
              <SubmitButton />

              {state.success && (
                <div className="mt-4">
                  <Alert variant="default" className="border-green-500/50 text-green-700 dark:border-green-500 [&>svg]:text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>সফল!</AlertTitle>
                    <AlertDescription>
                      আপনার রিপোর্ট সফলভাবে জমা হয়েছে।
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {state?.message && !state.success && typeof state.message === 'object' && Object.keys(state.message).length > 0 && (
                <div className="mt-4">
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>ত্রুটি</AlertTitle>
                      <AlertDescription>
                        <ul>
                          {Object.entries(state.message).map(([key, value]) => (
                            <li key={key}>{`${value}`}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                </div>
              )}
               {state?.message && !state.success && typeof state.message === 'string' && (
                 <div className="mt-4">
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>ত্রুটি</AlertTitle>
                      <AlertDescription>
                        {state.message}
                      </AlertDescription>
                    </Alert>
                 </div>
               )}
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

