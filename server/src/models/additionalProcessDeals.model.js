import { pgTable, varchar, decimal, timestamp, text} from "drizzle-orm/pg-core";
// Import the related table for foreign key reference
import { clientDeals } from "./clientDeals.model.js";


export const additionalProcessDeals = pgTable('additional_process_deals', {
    appid: varchar('appid', { length: 20 }).primaryKey(),
    deal_id: varchar('deal_id', { length: 20 }).notNull().references(() => clientDeals.deal_id),
    process_type: varchar('process_type', { length: 255 }),
    total_price: decimal('total_price', { precision: 10, scale: 2 }),
    notes: text('notes'),
    remarks: text('remarks'),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),

});
