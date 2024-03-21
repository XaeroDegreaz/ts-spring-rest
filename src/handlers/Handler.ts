/**
 * A generic handler class. Should have a vendor-specific implementation somewhere
 */
export abstract class Handler {
  /**
   * Create a new instance of a handler
   * @param controller The controller is the class instance, or class constructor to use for decorator scanning
   */
  constructor(protected controller: any) {
    this.controller = controller;
  }

  abstract handle(...args: any[]): any;

  /**
   * Using an inversion-of-control container, such as tsyringe, or typescript-ioc is supported
   * for constructing controller objects.
   * @param iocContainerGetMethod
   */
  withIocContainerGetMethod(iocContainerGetMethod: Function) {
    this.controller = iocContainerGetMethod(this.controller);
    return this;
  }
}
