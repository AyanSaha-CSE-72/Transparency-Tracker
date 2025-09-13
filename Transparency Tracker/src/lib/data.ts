import type { Report, Stats, DivisionDistricts } from './definitions';

export const divisionDistricts: DivisionDistricts = {
    "ঢাকা": ["ঢাকা", "গাজীপুর", "নারায়ণগঞ্জ", "টাঙ্গাইল", "কিশোরগঞ্জ", "মানিকগঞ্জ", "মুন্সিগঞ্জ", "রাজবাড়ী", "মাদারীপুর", "গোপালগঞ্জ", "ফরিদপুর", "শরীয়তপুর", "নরসিংদী"],
    "চট্টগ্রাম": ["চট্টগ্রাম", "কক্সবাজার", "রাঙ্গামাটি", "বান্দরবান", "খাগড়াছড়ি", "কুমিল্লা", "ফেনী", "লক্ষ্মীপুর", "চাঁদপুর", "নোয়াখালী", "ব্রাহ্মণবাড়িয়া"],
    "রাজশাহী": ["রাজশাহী", "নাটোর", "নওগাঁ", "চাঁপাইনবাবগঞ্জ", "পাবনা", "বগুড়া", "সিরাজগঞ্জ", "জয়পুরহাট"],
    "খুলনা": ["খুলনা", "বাগেরহাট", "সাতক্ষীরা", "যশোর", "নড়াইল", "চুয়াডাঙ্গা", "কুষ্টিয়া", "মাগুরা", "মেহেরপুর", "ঝিনাইদহ"],
    "বরিশাল": ["বরিশাল", "পটুয়াখালী", "ভোলা", "পিরোজপুর", "ঝালকাঠি", "বরগুনা"],
    "সিলেট": ["সিলেট", "মৌলভীবাজার", "হবিগঞ্জ", "সুনামগঞ্জ"],
    "রংপুর": ["রংপুর", "দিনাজপুর", "নীলফামারী", "গাইবান্ধা", "কুড়িগ্রাম", "লালমনিরহাট", "ঠাকুরগাঁও", "পঞ্চগড়"],
    "ময়মনসিংহ": ["ময়মনসিংহ", "শেরপুর", "জামালপুর", "নেত্রকোণা"]
};

export const categories = ["শিক্ষা", "স্বাস্থ্য", "পরিবহন", "স্থানীয় সরকার", "পুলিশ", "বিদ্যুৎ", "পানি", "অন্যান্য"];


export function getStats(reports: Report[]): Stats {
  const defaultStat = { name: '-', count: 0 };
  if (reports.length === 0) {
    return {
      totalReports: 0,
      topDistrict: defaultStat,
      topCategory: defaultStat,
      topDivision: defaultStat,
    };
  }

  const getTopItem = (key: 'district' | 'category' | 'division') => {
    const counts = reports.reduce((acc, report) => {
      const item = report[key];
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedItems = Object.entries(counts).sort(([, a], [, b]) => b - a);
    
    if (sortedItems.length === 0) {
      return defaultStat;
    }

    const [name, count] = sortedItems[0];
    return { name, count };
  };

  return {
    totalReports: reports.length,
    topDistrict: getTopItem('district'),
    topCategory: getTopItem('category'),
    topDivision: getTopItem('division'),
  };
}