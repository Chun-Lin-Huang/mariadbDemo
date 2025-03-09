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
}