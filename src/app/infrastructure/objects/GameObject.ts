export default abstract class GameObject {
  public x: number
  public y: number

  constructor(
    // TODO: Change all fields to private
    public color: string,
    public row: number,
    public col: number,
    public width: number,
    public height: number,
  ) {}

  public abstract draw(): void
}
