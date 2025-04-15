
export enum State {
    Progress = 0,
    Completed = 1,
    Paused = 2,
    Canceled = 3,
    Resting = 4,
}

export const STATES_MAP = new Map<State, string>([
    [State.Progress, 'progress'],
    [State.Completed, 'completed'],
    [State.Paused, 'paused'],
    [State.Canceled, 'canceled'],
    [State.Resting, 'resting'],
]);

export function getStateByLabel(label: string) {
    if (label === 'in Arbeit') {
        return State.Progress;
    } else if (label === 'fertiggestellt') {
        return State.Completed;
    } else if (label === 'pausiert') {
        return State.Paused;
    } else if (label === 'abgebrochen') {
        return State.Canceled;
    } else if (label === 'ruhend') {
        return State.Resting;
    } else {
        return null;
    }
}
