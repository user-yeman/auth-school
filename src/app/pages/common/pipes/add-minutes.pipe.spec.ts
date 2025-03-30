import { AddMinutesPipe } from './add-minutes.pipe';

describe('AddMinutesPipe', () => {
  it('create an instance', () => {
    const pipe = new AddMinutesPipe();
    expect(pipe).toBeTruthy();
  });
});
