export interface Course {
  id: number;
  title: string;
  weekdays: string[];
  price: number;
  target_raw: string;
  institution_name: string;
  address: string;
  start_date: string;
  end_date: string;
  registration_start: string;
  registration_end: string;
  homepage_url: string;
}
