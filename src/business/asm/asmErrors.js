export class AsmError extends Error {
  constructor(message) {
    super(message);
    this.name = "AsmError";
  }
}

export class SimulationError extends AsmError {
  constructor(message) {
    super(message);
    this.name = "SimulationError";
  }
}