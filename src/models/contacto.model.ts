export class Contacto {
  constructor(
    public email: string,
    public nombres: string,
    public apellidos: string,
    public comentarios: string,
    public adjunto?: File
  ) {}
}
