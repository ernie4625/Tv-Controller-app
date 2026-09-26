import { renderHook } from '@testing-library/react-native';

import { useTapCounter } from '@/ui/use-tap-counter';

describe('useTapCounter', () => {
  function setup(times: number[]) {
    const onTrigger = jest.fn();
    let i = 0;
    const now = () => times[i++];
    const { result } = renderHook(() => useTapCounter(onTrigger, 5, 1500, now));
    for (let n = 0; n < times.length; n++) result.current();
    return onTrigger;
  }

  it('triggers after 5 quick taps', () => {
    expect(setup([1000, 1200, 1400, 1600, 1800])).toHaveBeenCalledTimes(1);
  });

  it('does not trigger after 4 taps', () => {
    expect(setup([1000, 1200, 1400, 1600])).not.toHaveBeenCalled();
  });

  it('restarts the count when taps are too far apart', () => {
    expect(setup([1000, 1200, 1400, 1600, 5000])).not.toHaveBeenCalled();
  });

  it('resets after triggering so the next 5 taps trigger again', () => {
    const times = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900];
    expect(setup(times)).toHaveBeenCalledTimes(2);
  });
});
