import { Contorller } from "../abstract/Contorller";
import { Request, Response } from "express";
import { logger } from "../middlewares/log";
import { Service } from "../abstract/Service";
import { PageService } from "../Service/PageService";
import { DB } from "../app";
require('dotenv').config()

export class ReservationsController extends Contorller {
    protected service: Service;

    constructor() {
        super();
        this.service = new PageService();
    }

    public async test(req: Request, res: Response) {
        try {
            if (!DB.connection) {
                logger.error("Database connection not available.");
                return res.status(500).json({ error: "Database connection not established" });
            }

            const resp = await DB.connection.query("SELECT * FROM lab_b310.Reservations;");

            logger.info("Query executed successfully.");
            res.json(resp);
        } catch (error) {
            logger.error(`Database query error: ${error}`);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    public async multiDay(req: Request, res: Response) {
        try {
            if (!DB.connection) {
                logger.error("Database connection not available.");
                return res.status(500).json({ error: "Database connection not established" });
            }

            // 查詢 reservation_date 非空的資料（多日預約）
            const result = await DB.connection.query(`
            SELECT * FROM lab_b310.Reservations
            WHERE reservation_date IS NOT NULL
            ORDER BY reservation_date DESC, create_time DESC;
          `);

            logger.info("Multi-day reservations fetched successfully.");
            res.json(result);
        } catch (error) {
            logger.error(`Multi-day reservation query error: ${error}`);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    public async addMultiDayReservation(req: Request, res: Response) {
        try {
            if (!DB.connection) {
                logger.error("Database connection not available.");
                return res.status(500).json({ error: "Database connection not established" });
            }

            const { student_id, seat_id, timeslot_id, reservation_date } = req.body;

            // 檢查欄位
            if (!student_id || !seat_id || !timeslot_id || !reservation_date) {
                return res.status(400).json({ error: "Missing required fields" });
            }

            const sql = `
            INSERT INTO lab_b310.Reservations (student_id, seat_id, timeslot_id, reservation_date, create_time)
            VALUES (?, ?, ?, ?, NOW())
          `;

            await DB.connection.execute(sql, [student_id, seat_id, timeslot_id, reservation_date]);

            logger.info("New multi-day reservation created.");
            res.status(201).json({ message: "Reservation added successfully" });
        } catch (error) {
            logger.error(`Insert multi-day reservation failed: ${error}`);
            res.status(500).json({ error: "Internal server error" });
        }
    }
}