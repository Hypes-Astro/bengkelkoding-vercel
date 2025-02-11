export interface SelectLecture {
  id: number;
  identity_code: string;
  name: string;
  is_active: boolean;
}

export interface SelectAssistant {
  id: string;
  identity_code: string;
  name: string;
}

export interface SelectPeriod {
  id: number;
  period: string;
  is_active: boolean;
}

export interface SelectPath {
  id: number;
  name: string;
  description: string;
}

// respon data

export interface SelectDosenRespon {
  data: SelectLecture[];
}

export interface SelectAssistantRespon {
  data: SelectAssistant[];
}

export interface SelectPeriodRespon {
  data: SelectPeriod[];
}

export interface SelectPathRespon {
  data: SelectPath[];
}
