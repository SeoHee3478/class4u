export interface Course {
  id: number;
  title: string;
  weekdays: string[];
  price: number;
  target_raw: string;
  institution_name: string;
  address: string;
  start_date: string | null;
  end_date: string | null;
  registration_start: string | null;
  registration_end: string | null;
  homepage_url: string | null;
}
