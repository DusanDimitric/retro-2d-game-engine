export default abstract class GameObject {
  public x: number
  public y: number

  constructor(
    public color: string,
    public row: number,
    public col: number,
    public width: number,
    public height: number,
  ) {}

  public abstract draw(): void
}
