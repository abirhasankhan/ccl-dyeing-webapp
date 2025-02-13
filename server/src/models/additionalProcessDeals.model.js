import { pgTable, varchar, decimal, timestamp, text} from "drizzle-orm/pg-core";
// Import the related table for foreign key reference
import { clientDeals } from "./clientDeals.model.js";


export const additionalProcessDeals = pgTable('additional_process_deals', {
    appid: varchar('appid', { length: 255 }).primaryKey(),
    deal_id: varchar('deal_id', { length: 255 }).notNull().references(() => clientDeals.deal_id),
    process_type: varchar('process_type', { length: 255 }),
    price_tk: decimal('price_tk', { precision: 10, scale: 2 }),
    notes: text('notes'),
    remarks: text('remarks'),
    is_active: boolean('is_active').default(true),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),

});
