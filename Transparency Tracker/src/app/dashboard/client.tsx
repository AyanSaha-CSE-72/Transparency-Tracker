'use client';

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Building,
  MapPin,
  LayoutGrid,
  Filter,
  BarChart2,
  PieChart as PieIcon,
  LineChart as LineIcon,
  List,
  Sparkles,
  RefreshCw
} from 'lucide-react';

import { getStats, divisionDistricts, categories } from '@/lib/data';
import type { Report, Stats } from '@/lib/definitions';
import { generateSummaryAction } from '../actions';

const REPORTS_PER_PAGE = 10;
const PIE_CHART_COLORS = ['#3A7BD5', '#845EC2', '#00C9A7', '#FFC75F', '#FF6F91', '#D65DB1', '#4B4453', '#C34A36'];

type DashboardClientProps = {
  initialReports: Report[];
  initialStats: Stats;
};

export default function DashboardClient({ initialReports, initialStats }: DashboardClientProps) {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [stats, setStats] = useState<Stats | null>(initialStats);
  const [loading, setLoading] = useState(false); // No initial loading needed

  const [filterDivision, setFilterDivision] = useState('all');
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);

  const [summary, setSummary] = useState('');
  const [isSummaryLoading, startSummaryTransition] = useTransition();

  const { toast } = useToast();

  useEffect(() => {
    document.title = "Transparency Tracker - ড্যাশবোর্ড";
  }, []);

  const availableDistricts = useMemo(() => {
    if (filterDivision === 'all') {
      return Object.values(divisionDistricts).flat().sort();
    }
    return divisionDistricts[filterDivision] || [];
  }, [filterDivision]);
  
  useEffect(() => {
    setFilterDistrict("all");
    setCurrentPage(1);
  }, [filterDivision]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterDistrict, filterCategory]);


  const filteredReports = useMemo(() => {
    return reports
      .filter(report => filterDivision === 'all' || report.division === filterDivision)
      .filter(report => filterDistrict === 'all' || report.district === filterDistrict)
      .filter(report => filterCategory === 'all' || report.category === filterCategory);
  }, [reports, filterDivision, filterDistrict, filterCategory]);
  
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * REPORTS_PER_PAGE;
    return filteredReports.slice(startIndex, startIndex + REPORTS_PER_PAGE);
  }, [filteredReports, currentPage]);

  const totalPages = Math.ceil(filteredReports.length / REPORTS_PER_PAGE);

  const handleGenerateSummary = () => {
    startSummaryTransition(async () => {
      const result = await generateSummaryAction(filteredReports);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "সারাংশ তৈরিতে ত্রুটি",
          description: result.summary,
        })
      } else {
        setSummary(result.summary);
      }
    });
  };

  const resetFilters = () => {
    setFilterDivision('all');
    setFilterDistrict('all');
    setFilterCategory('all');
    setCurrentPage(1);
    setSummary('');
  };

  // Chart data processing
  const divisionChartData = useMemo(() => {
    const counts = filteredReports.reduce((acc, report) => {
        acc[report.division] = (acc[report.division] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    return Object.keys(divisionDistricts).map(div => ({ name: div, রিপোর্ট: counts[div] || 0 }));
  }, [filteredReports]);

  const categoryChartData = useMemo(() => {
    const counts = filteredReports.reduce((acc, report) => {
        acc[report.category] = (acc[report.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    return categories.map(cat => ({ name: cat, value: counts[cat] || 0 }));
  }, [filteredReports]);

  const districtChartData = useMemo(() => {
    const counts = filteredReports.reduce((acc, report) => {
        acc[report.district] = (acc[report.district] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 10).map(([name, count]) => ({ name, রিপোর্ট: count }));
  }, [filteredReports]);

  const timeChartData = useMemo(() => {
      const counts = filteredReports.reduce((acc, report) => {
          const month = report.date.substring(0, 7); // YYYY-MM
          acc[month] = (acc[month] || 0) + 1;
          return acc;
      }, {} as Record<string, number>);
      return Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)).map(([name, count]) => ({ name, রিপোর্ট: count }));
  }, [filteredReports]);
  
  const filteredStats = useMemo(() => getStats(filteredReports), [filteredReports]);


  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <main className="container max-w-7xl mx-auto bg-background/90 rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm">
        <header className="bg-primary/10 text-primary-foreground p-6 flex flex-col sm:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Transparency Tracker</h1>
            <p className="text-gray-600 mt-1">জেলা ভিত্তিক দুর্নীতি রিপোর্টিং সিস্টেম - ড্যাশবোর্ড</p>
          </div>
          <Button asChild className="mt-4 sm:mt-0 bg-primary hover:bg-primary/90">
            <Link href="/submit-report">
              <FileText className="mr-2 h-4 w-4" />
              রিপোর্ট জমা দিন
            </Link>
          </Button>
        </header>

        <div className="p-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-700">ড্যাশবোর্ড - দুর্নীতি রিপোর্ট বিশ্লেষণ</h2>
            <p className="text-muted-foreground">বিভাগ এবং জেলা ভিত্তিক ফিল্টার প্রয়োগ করুন</p>
          </div>
          
          {loading ? (
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
             </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">মোট রিপোর্ট</CardTitle>
                        <List className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{filteredStats.totalReports}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">সর্বাধিক রিপোর্টকৃত জেলা</CardTitle>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredStats.topDistrict.name}</div>
                        <p className="text-xs text-muted-foreground">{filteredStats.topDistrict.count} টি রিপোর্ট</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">সর্বাধিক রিপোর্টকৃত বিভাগ</CardTitle>
                        <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredStats.topCategory.name}</div>
                        <p className="text-xs text-muted-foreground">{filteredStats.topCategory.count} টি রিপোর্ট</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">সবচেয়ে সমস্যাপূর্ণ বিভাগ</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredStats.topDivision.name}</div>
                        <p className="text-xs text-muted-foreground">{filteredStats.topDivision.count} টি রিপোর্ট</p>
                    </CardContent>
                </Card>
            </div>
          )}

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5"/> বিশদ ফিল্টারিং</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div className="space-y-1">
                  <label htmlFor="filterDivision" className="text-sm font-medium">বিভাগ</label>
                  <Select value={filterDivision} onValueChange={setFilterDivision}>
                    <SelectTrigger><SelectValue placeholder="বিভাগ নির্বাচন করুন" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">সব বিভাগ</SelectItem>
                      {Object.keys(divisionDistricts).map(div => <SelectItem key={div} value={div}>{div}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label htmlFor="filterDistrict" className="text-sm font-medium">জেলা</label>
                  <Select value={filterDistrict} onValueChange={setFilterDistrict}>
                    <SelectTrigger><SelectValue placeholder="জেলা নির্বাচন করুন" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">সব জেলা</SelectItem>
                      {availableDistricts.map(dis => <SelectItem key={dis} value={dis}>{dis}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label htmlFor="filterCategory" className="text-sm font-medium">ক্যাটাগরি</label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger><SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">সব ক্যাটাগরি</SelectItem>
                      {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                 <div className="flex gap-2">
                    <Button onClick={resetFilters} variant="outline" className="w-full">
                        <RefreshCw className="mr-2 h-4 w-4"/> রিসেট
                    </Button>
                    <Button onClick={handleGenerateSummary} disabled={isSummaryLoading} className="w-full bg-accent hover:bg-accent/90">
                      <Sparkles className={`mr-2 h-4 w-4 ${isSummaryLoading ? 'animate-spin' : ''}`} />
                      {isSummaryLoading ? 'জেনারেট হচ্ছে...' : 'সারাংশ'}
                    </Button>
                 </div>
              </div>
              
              <Alert className="mt-4 bg-primary/5 border-primary/20">
                <AlertTitle className="text-primary">ফিল্টার ফলাফল</AlertTitle>
                <AlertDescription>
                  {filteredReports.length} টি রিপোর্ট পাওয়া গেছে।
                  {filterDivision !== 'all' && ` বিভাগ: ${filterDivision}. `}
                  {filterDistrict !== 'all' && ` জেলা: ${filterDistrict}. `}
                  {filterCategory !== 'all' && ` ক্যাটাগরি: ${filterCategory}.`}
                </AlertDescription>
              </Alert>
              
              {isSummaryLoading && <Skeleton className="h-20 mt-4" />}
              {summary && !isSummaryLoading && (
                  <Alert variant="default" className="mt-4">
                      <Sparkles className="h-4 w-4" />
                      <AlertTitle>জেনারেটেড সারাংশ</AlertTitle>
                      <AlertDescription>{summary}</AlertDescription>
                  </Alert>
              )}
            </CardContent>
          </Card>
          
          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><BarChart2 className="h-5 w-5"/> বিভাগ অনুযায়ী রিপোর্ট</CardTitle></CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={divisionChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Bar dataKey="রিপোর্ট" radius={[4, 4, 0, 0]}>
                            {divisionChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><PieIcon className="h-5 w-5"/> ক্যাটাগরি অনুযায়ী রিপোর্ট</CardTitle></CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={categoryChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                             {categoryChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><BarChart2 className="h-5 w-5"/> জেলা অনুযায়ী রিপোর্ট (শীর্ষ ১০)</CardTitle></CardHeader>
              <CardContent className="h-80">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={districtChartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis type="category" dataKey="name" width={80} fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Bar dataKey="রিপোর্ট" radius={[0, 4, 4, 0]}>
                            {districtChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><LineIcon className="h-5 w-5"/> সময় অনুযায়ী রিপোর্ট</CardTitle></CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={timeChartData}>
                      <defs>
                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="রিপোর্ট" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorUv)" strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><List className="h-5 w-5"/> ফিল্টার্ড রিপোর্টের তালিকা</CardTitle></CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>আইডি</TableHead>
                      <TableHead>বিভাগ</TableHead>
                      <TableHead>জেলা</TableHead>
                      <TableHead>ক্যাটাগরি</TableHead>
                      <TableHead>বিবরণ</TableHead>
                      <TableHead>তারিখ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedReports.length > 0 ? (
                      paginatedReports.map(report => (
                        <TableRow key={report.id}>
                          <TableCell>{report.id}</TableCell>
                          <TableCell>{report.division}</TableCell>
                          <TableCell>{report.district}</TableCell>
                          <TableCell>{report.category}</TableCell>
                          <TableCell className="max-w-xs break-words">{report.description}</TableCell>
                          <TableCell>{report.date}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">কোন রিপোর্ট পাওয়া যায়নি</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>পূর্ববর্তী</Button>
                  <span className="text-sm">পৃষ্ঠা {currentPage} এর {totalPages}</span>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>পরবর্তী</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
