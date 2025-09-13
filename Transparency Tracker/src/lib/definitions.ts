export type Report = {
  id: number;
  division: string;
  district: string;
  category: string;
  description: string;
  date: string;
};

export type Stats = {
  totalReports: number;
  topDistrict: { name: string; count: number };
  topCategory: { name: string; count: number };
  topDivision: { name: string; count: number };
};

export type DivisionDistricts = {
  [key: string]: string[];
};

export type ChartData = {
  name: string;
  value: number;
}[];
