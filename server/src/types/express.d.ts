declare module "express" {
  type Handler = (req: any, res: any) => void;

  interface ExpressApp {
    use: (...args: unknown[]) => ExpressApp;
    get: (path: string, handler: Handler) => ExpressApp;
  }

  interface ExpressFactory {
    (): ExpressApp;
    json: () => unknown;
  }

  const express: ExpressFactory;
  export default express;
}
