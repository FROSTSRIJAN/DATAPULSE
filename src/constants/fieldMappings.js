/**
 * Universal Field Mappings — Schema-Agnostic Architecture
 * 
 * Fields are organized by DATASET TYPE, not hardcoded globally.
 * Each dataset type defines its own canonical fields, required fields, and aliases.
 * Aliases use fuzzy matching patterns that work with renamed/unknown columns.
 */

// ─── SEMANTIC FIELD DEFINITIONS ─────────────────────────────────────────────
// Each field has: id, label, category, aliases (extensive fuzzy set), validatorType

export const UNIVERSAL_FIELDS = {
  // ── Identifiers ──
  customer_id: {
    id: 'customer_id', label: 'Customer ID', category: 'identifier',
    validatorType: 'identifier',
    aliases: ['customer_id', 'customerid', 'cust_id', 'custid', 'client_id', 'clientid',
      'user_id', 'userid', 'member_id', 'memberid', 'member_code', 'client_number',
      'customer_number', 'cid', 'account_id', 'accountid', 'subscriber_id', 'patron_id',
      'buyer_id', 'contact_id', 'person_id', 'lead_id'],
  },
  order_id: {
    id: 'order_id', label: 'Order ID', category: 'identifier',
    validatorType: 'identifier',
    aliases: ['order_id', 'orderid', 'order_number', 'orderno', 'order_no', 'transaction_id',
      'txn_id', 'txnid', 'invoice_id', 'invoiceid', 'invoice_number', 'invoice_no',
      'receipt_id', 'receipt_no', 'sale_id', 'booking_id', 'reference_id', 'ref_id',
      'confirmation_id', 'order_ref', 'po_number', 'purchase_order_id'],
  },
  product_id: {
    id: 'product_id', label: 'Product ID', category: 'identifier',
    validatorType: 'identifier',
    aliases: ['product_id', 'productid', 'prod_id', 'item_id', 'itemid', 'sku', 'sku_id',
      'product_code', 'prodcode', 'item_code', 'barcode', 'upc', 'asin', 'catalog_id',
      'article_number', 'material_id', 'part_number', 'part_id', 'good_id'],
  },
  employee_id: {
    id: 'employee_id', label: 'Employee ID', category: 'identifier',
    validatorType: 'identifier',
    aliases: ['employee_id', 'employeeid', 'emp_id', 'empid', 'staff_id', 'staffid',
      'worker_id', 'workerid', 'personnel_id', 'badge_id', 'associate_id', 'team_member_id',
      'hr_id', 'payroll_id', 'emp_number', 'employee_number', 'emp_code'],
  },

  // ── Names ──
  customer_name: {
    id: 'customer_name', label: 'Customer Name', category: 'name',
    validatorType: 'text',
    aliases: ['customer_name', 'customername', 'full_name', 'fullname', 'name', 'client_name',
      'buyer_name', 'user_name', 'username', 'contact_name', 'subscriber_name', 'patron_name',
      'member_name', 'person_name', 'display_name', 'account_name', 'first_name',
      'last_name', 'fname', 'lname', 'given_name', 'surname'],
  },
  employee_name: {
    id: 'employee_name', label: 'Employee Name', category: 'name',
    validatorType: 'text',
    aliases: ['employee_name', 'employeename', 'emp_name', 'empname', 'staff_name',
      'worker_name', 'associate_name', 'team_member', 'personnel_name'],
  },
  product_name: {
    id: 'product_name', label: 'Product Name', category: 'name',
    validatorType: 'text',
    aliases: ['product_name', 'productname', 'product', 'item_name', 'itemname', 'item',
      'product_title', 'title', 'goods', 'sku_name', 'article_name', 'material_name',
      'item_description', 'good_name', 'merchandise'],
  },

  // ── Contact ──
  email: {
    id: 'email', label: 'Email', category: 'contact',
    validatorType: 'email',
    aliases: ['email', 'email_address', 'emailaddress', 'email_id', 'emailid', 'mail',
      'e_mail', 'contact_email', 'customer_email', 'user_email', 'work_email',
      'personal_email', 'primary_email', 'secondary_email', 'email_addr'],
  },
  phone: {
    id: 'phone', label: 'Phone', category: 'contact',
    validatorType: 'phone',
    aliases: ['phone', 'phone_number', 'phonenumber', 'mobile', 'mobile_number', 'mobilenumber',
      'contact', 'telephone', 'tel', 'cell', 'cell_number', 'cellphone', 'contact_number',
      'contact_phone', 'customer_phone', 'home_phone', 'work_phone', 'primary_phone',
      'landline', 'fax'],
  },

  // ── Location ──
  city: {
    id: 'city', label: 'City', category: 'location',
    validatorType: 'text',
    aliases: ['city', 'town', 'municipality', 'locale', 'metro', 'urban_area'],
  },
  state: {
    id: 'state', label: 'State / Region', category: 'location',
    validatorType: 'text',
    aliases: ['state', 'province', 'region', 'state_province', 'territory', 'prefecture',
      'county', 'district'],
  },
  country: {
    id: 'country', label: 'Country', category: 'location',
    validatorType: 'text',
    aliases: ['country', 'country_code', 'nation', 'geo', 'country_name', 'nationality',
      'country_region', 'iso_country'],
  },
  address: {
    id: 'address', label: 'Address', category: 'location',
    validatorType: 'text',
    aliases: ['address', 'street', 'street_address', 'address_line_1', 'address1', 'location',
      'full_address', 'mailing_address', 'billing_address', 'shipping_address', 'postal_address'],
  },
  zip_code: {
    id: 'zip_code', label: 'Zip / Postal Code', category: 'location',
    validatorType: 'text',
    aliases: ['zip_code', 'zipcode', 'zip', 'postal_code', 'postalcode', 'pin_code', 'pincode',
      'postcode', 'post_code'],
  },

  // ── Dates ──
  signup_date: {
    id: 'signup_date', label: 'Signup Date', category: 'date',
    validatorType: 'date',
    aliases: ['signup_date', 'signupdate', 'join_date', 'joindate', 'registration_date',
      'created_at', 'created_date', 'createdat', 'date_joined', 'enrolled_date',
      'onboarding_date', 'account_created', 'date_created', 'registered_on'],
  },
  order_date: {
    id: 'order_date', label: 'Order Date', category: 'date',
    validatorType: 'date',
    aliases: ['order_date', 'orderdate', 'transaction_date', 'txn_date', 'purchase_date',
      'date', 'sale_date', 'invoice_date', 'booking_date', 'payment_date', 'order_dt',
      'created_at', 'created_date', 'date_time', 'timestamp'],
  },
  order_time: {
    id: 'order_time', label: 'Order Time', category: 'date',
    validatorType: 'time',
    aliases: ['order_time', 'time', 'transaction_time', 'created_time', 'purchase_time',
      'timestamp', 'order_timestamp'],
  },
  hire_date: {
    id: 'hire_date', label: 'Hire Date', category: 'date',
    validatorType: 'date',
    aliases: ['hire_date', 'hiredate', 'date_of_hire', 'joining_date', 'start_date',
      'employment_date', 'onboard_date', 'date_hired'],
  },

  // ── Financial ──
  order_amount: {
    id: 'order_amount', label: 'Amount', category: 'financial',
    validatorType: 'amount',
    aliases: ['order_amount', 'amount', 'total', 'total_amount', 'price', 'value', 'revenue',
      'order_total', 'grand_total', 'net_amount', 'gross_amount', 'sale_amount',
      'transaction_amount', 'txn_amount', 'bill_amount', 'cost', 'subtotal', 'sum',
      'payment_amount', 'charge', 'fee'],
  },
  unit_price: {
    id: 'unit_price', label: 'Unit Price', category: 'financial',
    validatorType: 'amount',
    aliases: ['unit_price', 'price', 'item_price', 'cost', 'rate', 'unit_cost', 'mrp',
      'retail_price', 'selling_price', 'list_price', 'msrp', 'base_price'],
  },
  salary: {
    id: 'salary', label: 'Salary', category: 'financial',
    validatorType: 'amount',
    aliases: ['salary', 'wage', 'pay', 'compensation', 'ctc', 'annual_salary', 'monthly_salary',
      'base_salary', 'gross_salary', 'net_salary', 'income', 'earnings', 'remuneration'],
  },

  // ── Product / Item ──
  quantity: {
    id: 'quantity', label: 'Quantity', category: 'numeric',
    validatorType: 'quantity',
    aliases: ['quantity', 'qty', 'units', 'count', 'items_count', 'num_items', 'pieces',
      'lot_size', 'order_qty', 'units_ordered'],
  },
  category: {
    id: 'category', label: 'Category', category: 'classification',
    validatorType: 'text',
    aliases: ['category', 'type', 'product_category', 'department', 'group', 'class',
      'segment', 'division', 'product_type', 'item_category', 'classification'],
  },
  brand: {
    id: 'brand', label: 'Brand', category: 'classification',
    validatorType: 'text',
    aliases: ['brand', 'manufacturer', 'vendor', 'maker', 'brand_name', 'supplier',
      'company', 'producer', 'label'],
  },
  stock: {
    id: 'stock', label: 'Stock', category: 'numeric',
    validatorType: 'quantity',
    aliases: ['stock', 'inventory', 'quantity_in_stock', 'units_available', 'stock_qty',
      'available_qty', 'on_hand', 'in_stock', 'warehouse_qty', 'stock_level'],
  },

  // ── Transaction Meta ──
  payment_method: {
    id: 'payment_method', label: 'Payment Method', category: 'classification',
    validatorType: 'payment',
    aliases: ['payment_method', 'payment_mode', 'paymentmethod', 'payment', 'pay_method',
      'payment_type', 'mode_of_payment', 'pay_type', 'tender_type', 'instrument'],
  },
  transaction_status: {
    id: 'transaction_status', label: 'Status', category: 'classification',
    validatorType: 'status',
    aliases: ['transaction_status', 'status', 'order_status', 'txn_status', 'state',
      'fulfillment_status', 'delivery_status', 'payment_status', 'current_status',
      'shipment_status'],
  },

  // ── Employee Meta ──
  department: {
    id: 'department', label: 'Department', category: 'classification',
    validatorType: 'text',
    aliases: ['department', 'dept', 'division', 'team', 'unit', 'group', 'org_unit',
      'business_unit', 'section'],
  },
  designation: {
    id: 'designation', label: 'Designation / Title', category: 'classification',
    validatorType: 'text',
    aliases: ['designation', 'title', 'job_title', 'position', 'role', 'rank',
      'grade', 'level', 'job_role', 'occupation', 'profession'],
  },
  age: {
    id: 'age', label: 'Age', category: 'numeric',
    validatorType: 'quantity',
    aliases: ['age', 'customer_age', 'user_age', 'years_old'],
  },
  gender: {
    id: 'gender', label: 'Gender', category: 'classification',
    validatorType: 'text',
    aliases: ['gender', 'sex', 'male_female'],
  },
  dob: {
    id: 'dob', label: 'Date of Birth', category: 'date',
    validatorType: 'date',
    aliases: ['dob', 'date_of_birth', 'birthdate', 'birth_date', 'birthday'],
  },
};

// ─── DATASET TYPE TEMPLATES ─────────────────────────────────────────────────
// Each template defines which fields to show, which are required, and validation rules.

export const DATASET_TEMPLATES = {
  customer: {
    id: 'customer',
    type: 'Customer Dataset',
    icon: '👤',
    color: '#6366f1',
    description: 'CRM customer master data with contact and profile information',
    fields: ['customer_id', 'customer_name', 'email', 'phone', 'city', 'state', 'country', 'address', 'zip_code', 'signup_date', 'age', 'gender', 'dob'],
    required: ['customer_id', 'customer_name', 'email'],
    validationRules: ['Email Validation', 'Phone Validation', 'Duplicate Detection', 'Missing Value Analysis'],
    detectedAttributes: ['Customer Identifier', 'Contact Information', 'Geographic Data', 'Registration History'],
  },
  transaction: {
    id: 'transaction',
    type: 'Transaction Dataset',
    icon: '💳',
    color: '#22c55e',
    description: 'Sales and transaction records with order and payment data',
    fields: ['order_id', 'customer_name', 'email', 'phone', 'product_name', 'quantity', 'order_amount', 'unit_price', 'payment_method', 'transaction_status', 'order_date', 'order_time', 'country'],
    required: ['order_id', 'order_date', 'order_amount'],
    validationRules: ['Amount Validation', 'Date Format Validation', 'Duplicate Detection', 'Payment Method Validation'],
    detectedAttributes: ['Transaction Identifier', 'Financial Data', 'Payment Information', 'Temporal Data'],
  },
  product: {
    id: 'product',
    type: 'Product Dataset',
    icon: '📦',
    color: '#f59e0b',
    description: 'Product catalog with inventory and pricing information',
    fields: ['product_id', 'product_name', 'category', 'brand', 'unit_price', 'stock', 'quantity'],
    required: ['product_id', 'product_name'],
    validationRules: ['Price Validation', 'Stock Level Checks', 'Duplicate Detection', 'Category Consistency'],
    detectedAttributes: ['Product Identifier', 'Catalog Information', 'Pricing Data', 'Inventory Levels'],
  },
  employee: {
    id: 'employee',
    type: 'Employee Dataset',
    icon: '🏢',
    color: '#8b5cf6',
    description: 'HR and employee records with personal and organizational data',
    fields: ['employee_id', 'employee_name', 'email', 'phone', 'department', 'designation', 'salary', 'hire_date', 'city', 'country', 'age', 'gender', 'dob'],
    required: ['employee_id', 'employee_name'],
    validationRules: ['Email Validation', 'Phone Validation', 'Salary Range Checks', 'Duplicate Detection'],
    detectedAttributes: ['Employee Identifier', 'Contact Information', 'Organizational Data', 'Compensation Data'],
  },
  financial: {
    id: 'financial',
    type: 'Financial Dataset',
    icon: '💰',
    color: '#14b8a6',
    description: 'Financial records with monetary values and transaction details',
    fields: ['order_id', 'order_amount', 'unit_price', 'order_date', 'payment_method', 'transaction_status', 'customer_name', 'category'],
    required: ['order_id', 'order_amount'],
    validationRules: ['Amount Validation', 'Currency Consistency', 'Duplicate Detection', 'Date Validation'],
    detectedAttributes: ['Transaction Identifier', 'Monetary Values', 'Payment Information', 'Temporal Data'],
  },
  inventory: {
    id: 'inventory',
    type: 'Inventory Dataset',
    icon: '📋',
    color: '#f97316',
    description: 'Warehouse and inventory tracking data',
    fields: ['product_id', 'product_name', 'stock', 'category', 'brand', 'unit_price', 'quantity'],
    required: ['product_id', 'stock'],
    validationRules: ['Stock Level Validation', 'Negative Quantity Detection', 'Duplicate Detection'],
    detectedAttributes: ['Product Identifier', 'Stock Levels', 'Warehouse Data', 'Supply Metrics'],
  },
  custom: {
    id: 'custom',
    type: 'Custom Dataset',
    icon: '🗂️',
    color: '#71717a',
    description: 'Generic dataset — define your own field mappings',
    fields: Object.keys(UNIVERSAL_FIELDS),
    required: [],
    validationRules: ['Duplicate Detection', 'Missing Value Analysis'],
    detectedAttributes: [],
  },
};

/**
 * Get the canonical fields for a given dataset type template.
 * Returns only the UNIVERSAL_FIELDS objects that belong to that template.
 */
export function getFieldsForTemplate(templateId) {
  const template = DATASET_TEMPLATES[templateId];
  if (!template) return Object.values(UNIVERSAL_FIELDS);
  return template.fields
    .map((fid) => UNIVERSAL_FIELDS[fid])
    .filter(Boolean);
}

/**
 * Get required field IDs for a given dataset type template.
 */
export function getRequiredFieldsForTemplate(templateId) {
  const template = DATASET_TEMPLATES[templateId];
  if (!template) return [];
  return template.required || [];
}

/**
 * Map a detected dataset type string to a template ID.
 */
export function typeToTemplateId(detectedType) {
  const map = {
    'Customer Dataset': 'customer',
    'Transaction Dataset': 'transaction',
    'Product Dataset': 'product',
    'Employee Dataset': 'employee',
    'Financial Dataset': 'financial',
    'Inventory Dataset': 'inventory',
    'Mixed Dataset': 'custom',
    'Unknown Dataset': 'custom',
  };
  return map[detectedType] || 'custom';
}

// Legacy exports for backward compatibility
export const CANONICAL_FIELDS = Object.values(UNIVERSAL_FIELDS);
export const REQUIRED_FIELDS = ['order_id', 'order_date', 'order_amount'];
