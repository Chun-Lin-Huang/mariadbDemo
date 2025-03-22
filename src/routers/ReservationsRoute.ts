import { Route } from "../abstract/Route"
import { ReservationsController } from "../controller/ReservationsController";

export class ReservationsRoute extends Route {

    protected url: string;
    protected Contorller = new ReservationsController();

    constructor() {
        super()
        this.url = '/Reservations/'
        this.setRoutes()
    }

    protected setRoutes(): void {
        this.router.get(`${this.url}test`, (req, res) => {
            this.Contorller.test(req, res);
        });

        // 新增多日預約
        this.router.post(`${this.url}multiday-booking`, (req, res) => {
            this.Contorller.addMultiDayReservation(req, res);
          });          
    }
}