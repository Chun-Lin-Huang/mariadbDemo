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

    public async addMultiDayReservation(req: Request, res: Response) {
        try {
            if (!DB.connection) {
                logger.error("DB not connected");
                return res.status(500).json({ error: "DB not connected" });
            }

            const { student_id, seat_id, timeslot_id, reservation_date } = req.body;
            console.log("Received:", req.body);

            if (!student_id || !seat_id || !timeslot_id || !reservation_date) {
                return res.status(400).json({ error: "Missing fields" });
            }

            // 查詢是否重複
            const [rows] = await DB.connection.query(
                `SELECT 1 FROM lab_b310.Reservations
             WHERE seat_id = ? AND timeslot_id = ? AND reservation_date = ?`,
                [seat_id, timeslot_id, reservation_date]
            );

            // 一定要確認 rows 是陣列再用 .length
            if (Array.isArray(rows) && rows.length > 0) {
                return res.status(409).json({ error: "Reservation already exists" });
            }

            // 若沒重複才插入
            await DB.connection.execute(
                `INSERT INTO lab_b310.Reservations
              (student_id, seat_id, timeslot_id, reservation_date, create_time)
             VALUES (?, ?, ?, ?, NOW())`,
                [student_id, seat_id, timeslot_id, reservation_date]
            );

            logger.info("Reservation inserted");
            res.status(201).json({ message: "Reservation added" });

        } catch (error: any) {
            if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
                logger.warn("MySQL Duplicate Entry 被攔截");
                return res.status(409).json({ error: "Reservation already exists (duplicate)" });
            }

            logger.error("INSERT ERROR:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
}