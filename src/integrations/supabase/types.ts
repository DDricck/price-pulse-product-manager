export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      addr_cat_code1: {
        Row: {
          addrcatcodeid: string
          addrcatcodekey: number
          addrcatdesc: string
        }
        Insert: {
          addrcatcodeid: string
          addrcatcodekey: number
          addrcatdesc: string
        }
        Update: {
          addrcatcodeid?: string
          addrcatcodekey?: number
          addrcatdesc?: string
        }
        Relationships: []
      }
      addr_cat_code2: {
        Row: {
          addrcatcodeid: string
          addrcatcodekey: number
          addrcatdesc: string
        }
        Insert: {
          addrcatcodeid: string
          addrcatcodekey: number
          addrcatdesc: string
        }
        Update: {
          addrcatcodeid?: string
          addrcatcodekey?: number
          addrcatdesc?: string
        }
        Relationships: []
      }
      branch_plant_dim: {
        Row: {
          bpname: string | null
          branchplantid: string
          branchplantkey: number
          carryingcost: number
          companykey: number | null
          costmethod: string
        }
        Insert: {
          bpname?: string | null
          branchplantid: string
          branchplantkey: number
          carryingcost: number
          companykey?: number | null
          costmethod: string
        }
        Update: {
          bpname?: string | null
          branchplantid?: string
          branchplantkey?: number
          carryingcost?: number
          companykey?: number | null
          costmethod?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_plant_companyid_fk"
            columns: ["companykey"]
            isOneToOne: false
            referencedRelation: "company_dim"
            referencedColumns: ["companykey"]
          },
        ]
      }
      company_dim: {
        Row: {
          companyid: string
          companykey: number
          companyname: string
          currencycode: string
          currencydesc: string
        }
        Insert: {
          companyid: string
          companykey: number
          companyname: string
          currencycode: string
          currencydesc: string
        }
        Update: {
          companyid?: string
          companykey?: number
          companyname?: string
          currencycode?: string
          currencydesc?: string
        }
        Relationships: []
      }
      currency_dim: {
        Row: {
          currency_id: string | null
          exchange_rate: number | null
        }
        Insert: {
          currency_id?: string | null
          exchange_rate?: number | null
        }
        Update: {
          currency_id?: string | null
          exchange_rate?: number | null
        }
        Relationships: []
      }
      cust_vendor_dim: {
        Row: {
          addrbookid: number
          addrcatcode1: number | null
          addrcatcode2: number | null
          address: string
          city: string
          country: string | null
          custvendorkey: number
          name: string
          primzip: number
          state: string
          zip: string
        }
        Insert: {
          addrbookid: number
          addrcatcode1?: number | null
          addrcatcode2?: number | null
          address: string
          city: string
          country?: string | null
          custvendorkey: number
          name: string
          primzip: number
          state: string
          zip: string
        }
        Update: {
          addrbookid?: number
          addrcatcode1?: number | null
          addrcatcode2?: number | null
          address?: string
          city?: string
          country?: string | null
          custvendorkey?: number
          name?: string
          primzip?: number
          state?: string
          zip?: string
        }
        Relationships: [
          {
            foreignKeyName: "cust_vend_catcode1_fk"
            columns: ["addrcatcode1"]
            isOneToOne: false
            referencedRelation: "addr_cat_code1"
            referencedColumns: ["addrcatcodekey"]
          },
          {
            foreignKeyName: "cust_vend_catcode2_fk"
            columns: ["addrcatcode2"]
            isOneToOne: false
            referencedRelation: "addr_cat_code2"
            referencedColumns: ["addrcatcodekey"]
          },
        ]
      }
      customer: {
        Row: {
          address: string | null
          custname: string | null
          custno: string
          payterm: string | null
        }
        Insert: {
          address?: string | null
          custname?: string | null
          custno: string
          payterm?: string | null
        }
        Update: {
          address?: string | null
          custname?: string | null
          custno?: string
          payterm?: string | null
        }
        Relationships: []
      }
      date_dim: {
        Row: {
          calday: number
          calmonth: number
          calquarter: number
          calyear: number
          datejulian: number
          datekey: number
          dayofweek: number
          fiscalperiod: number
          fiscalyear: number
        }
        Insert: {
          calday: number
          calmonth: number
          calquarter: number
          calyear: number
          datejulian: number
          datekey: number
          dayofweek: number
          fiscalperiod: number
          fiscalyear: number
        }
        Update: {
          calday?: number
          calmonth?: number
          calquarter?: number
          calyear?: number
          datejulian?: number
          datekey?: number
          dayofweek?: number
          fiscalperiod?: number
          fiscalyear?: number
        }
        Relationships: []
      }
      department: {
        Row: {
          deptcode: string
          deptname: string | null
        }
        Insert: {
          deptcode: string
          deptname?: string | null
        }
        Update: {
          deptcode?: string
          deptname?: string | null
        }
        Relationships: []
      }
      employee: {
        Row: {
          birthdate: string | null
          empno: string
          firstname: string | null
          gender: string | null
          hiredate: string | null
          lastname: string | null
          sepdate: string | null
        }
        Insert: {
          birthdate?: string | null
          empno: string
          firstname?: string | null
          gender?: string | null
          hiredate?: string | null
          lastname?: string | null
          sepdate?: string | null
        }
        Update: {
          birthdate?: string | null
          empno?: string
          firstname?: string | null
          gender?: string | null
          hiredate?: string | null
          lastname?: string | null
          sepdate?: string | null
        }
        Relationships: []
      }
      inventory_fact: {
        Row: {
          branchplantkey: number
          custvendorkey: number | null
          datekey: number
          extcost: number | null
          inventorykey: number
          itemmasterkey: number
          quantity: number | null
          transtypekey: number
          unitcost: number | null
        }
        Insert: {
          branchplantkey: number
          custvendorkey?: number | null
          datekey: number
          extcost?: number | null
          inventorykey: number
          itemmasterkey: number
          quantity?: number | null
          transtypekey: number
          unitcost?: number | null
        }
        Update: {
          branchplantkey?: number
          custvendorkey?: number | null
          datekey?: number
          extcost?: number | null
          inventorykey?: number
          itemmasterkey?: number
          quantity?: number | null
          transtypekey?: number
          unitcost?: number | null
        }
        Relationships: []
      }
      item_cat_code1: {
        Row: {
          itemcatcodeid: string
          itemcatcodekey: number
          itemcatdesc: string
        }
        Insert: {
          itemcatcodeid: string
          itemcatcodekey: number
          itemcatdesc: string
        }
        Update: {
          itemcatcodeid?: string
          itemcatcodekey?: number
          itemcatdesc?: string
        }
        Relationships: []
      }
      item_cat_code2: {
        Row: {
          itemcatcodeid: string
          itemcatcodekey: number
          itemcatdesc: string
        }
        Insert: {
          itemcatcodeid: string
          itemcatcodekey: number
          itemcatdesc: string
        }
        Update: {
          itemcatcodeid?: string
          itemcatcodekey?: number
          itemcatdesc?: string
        }
        Relationships: []
      }
      item_master_dim: {
        Row: {
          itemcatcode1: number | null
          itemcatcode2: number | null
          itemdesc: string | null
          itemmasterkey: number
          seconditemid: string
          shortitemid: number
          thirditemid: string
          uom: string | null
        }
        Insert: {
          itemcatcode1?: number | null
          itemcatcode2?: number | null
          itemdesc?: string | null
          itemmasterkey: number
          seconditemid: string
          shortitemid: number
          thirditemid: string
          uom?: string | null
        }
        Update: {
          itemcatcode1?: number | null
          itemcatcode2?: number | null
          itemdesc?: string | null
          itemmasterkey?: number
          seconditemid?: string
          shortitemid?: number
          thirditemid?: string
          uom?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "item_master_catcode1_fk"
            columns: ["itemcatcode1"]
            isOneToOne: false
            referencedRelation: "item_cat_code1"
            referencedColumns: ["itemcatcodekey"]
          },
          {
            foreignKeyName: "item_master_catcode2_fk"
            columns: ["itemcatcode2"]
            isOneToOne: false
            referencedRelation: "item_cat_code2"
            referencedColumns: ["itemcatcodekey"]
          },
        ]
      }
      job: {
        Row: {
          jobcode: string
          jobdesc: string | null
        }
        Insert: {
          jobcode: string
          jobdesc?: string | null
        }
        Update: {
          jobcode?: string
          jobdesc?: string | null
        }
        Relationships: []
      }
      jobhistory: {
        Row: {
          deptcode: string | null
          effdate: string
          empno: string
          jobcode: string
          salary: number | null
        }
        Insert: {
          deptcode?: string | null
          effdate: string
          empno: string
          jobcode: string
          salary?: number | null
        }
        Update: {
          deptcode?: string | null
          effdate?: string
          empno?: string
          jobcode?: string
          salary?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "jobhistory_deptcode_fkey"
            columns: ["deptcode"]
            isOneToOne: false
            referencedRelation: "department"
            referencedColumns: ["deptcode"]
          },
          {
            foreignKeyName: "jobhistory_empno_fkey"
            columns: ["empno"]
            isOneToOne: false
            referencedRelation: "employee"
            referencedColumns: ["empno"]
          },
          {
            foreignKeyName: "jobhistory_jobcode_fkey"
            columns: ["jobcode"]
            isOneToOne: false
            referencedRelation: "job"
            referencedColumns: ["jobcode"]
          },
        ]
      }
      payment: {
        Row: {
          amount: number | null
          orno: string
          paydate: string | null
          transno: string | null
        }
        Insert: {
          amount?: number | null
          orno: string
          paydate?: string | null
          transno?: string | null
        }
        Update: {
          amount?: number | null
          orno?: string
          paydate?: string | null
          transno?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transno_fkey"
            columns: ["transno"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["transno"]
          },
        ]
      }
      pricehist: {
        Row: {
          effdate: string
          prodcode: string
          unitprice: number | null
        }
        Insert: {
          effdate: string
          prodcode: string
          unitprice?: number | null
        }
        Update: {
          effdate?: string
          prodcode?: string
          unitprice?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pricehist_prodcode_fkey"
            columns: ["prodcode"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["prodcode"]
          },
        ]
      }
      product: {
        Row: {
          description: string | null
          prodcode: string
          unit: string | null
        }
        Insert: {
          description?: string | null
          prodcode: string
          unit?: string | null
        }
        Update: {
          description?: string | null
          prodcode?: string
          unit?: string | null
        }
        Relationships: []
      }
      sales: {
        Row: {
          custno: string | null
          empno: string | null
          salesdate: string | null
          transno: string
        }
        Insert: {
          custno?: string | null
          empno?: string | null
          salesdate?: string | null
          transno: string
        }
        Update: {
          custno?: string | null
          empno?: string | null
          salesdate?: string | null
          transno?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_custno_fkey"
            columns: ["custno"]
            isOneToOne: false
            referencedRelation: "customer"
            referencedColumns: ["custno"]
          },
          {
            foreignKeyName: "sales_empno_fkey"
            columns: ["empno"]
            isOneToOne: false
            referencedRelation: "employee"
            referencedColumns: ["empno"]
          },
        ]
      }
      salesdetail: {
        Row: {
          prodcode: string
          quantity: number | null
          transno: string
        }
        Insert: {
          prodcode: string
          quantity?: number | null
          transno: string
        }
        Update: {
          prodcode?: string
          quantity?: number | null
          transno?: string
        }
        Relationships: [
          {
            foreignKeyName: "salesdetail_prodcode_fkey"
            columns: ["prodcode"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["prodcode"]
          },
          {
            foreignKeyName: "salesdetail_transno_fkey"
            columns: ["transno"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["transno"]
          },
        ]
      }
      trans_type_dim: {
        Row: {
          transdescription: string
          transtypecodeid: string
          transtypekey: number
        }
        Insert: {
          transdescription: string
          transtypecodeid: string
          transtypekey: number
        }
        Update: {
          transdescription?: string
          transtypecodeid?: string
          transtypekey?: number
        }
        Relationships: []
      }
      zip_codes: {
        Row: {
          zipcity: string
          zipconsec: number | null
          zipkey: number
          zipstate: string
          zipweight: number | null
          zipzip: number | null
        }
        Insert: {
          zipcity: string
          zipconsec?: number | null
          zipkey: number
          zipstate: string
          zipweight?: number | null
          zipzip?: number | null
        }
        Update: {
          zipcity?: string
          zipconsec?: number | null
          zipkey?: number
          zipstate?: string
          zipweight?: number | null
          zipzip?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
