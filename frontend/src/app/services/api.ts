import { alertasService } from './alertas.service';
import { authService } from './auth.service';
import { equiposService } from './equipos.service';
import { mantenimientosService } from './mantenimientos.service';
import { usuariosService } from './usuarios.service';

export const api = {
  ...authService,
  ...usuariosService,
  ...equiposService,
  ...mantenimientosService,
  ...alertasService,
};
