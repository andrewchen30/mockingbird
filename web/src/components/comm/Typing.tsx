import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

interface Props {
  list: string[];
  typingDelay: number;
  sentenceDelay: number;
  sentenceShowTime: number;
  backspaceDelay: number;
}

function Typing(props: Props) {
  const [showing, setShowing] = useState({ idx: 0, text: '', direction: 1 });
  const {
    list,
    sentenceDelay,
    typingDelay,
    sentenceShowTime,
    backspaceDelay,
  } = props;

  const render = useCallback(() => {
    if (showing.direction === -1 && showing.text.length === 0) {
      setTimeout(() => {
        setShowing({
          direction: 1,
          text: '',
          idx: showing.idx < list.length - 1 ? showing.idx + 1 : 0,
        });
      }, sentenceDelay);
      return;
    }

    if (showing.text.length === list[showing.idx].length) {
      setTimeout(() => {
        setShowing({
          idx: showing.idx,
          direction: -1,
          text: list[showing.idx].substring(0, showing.text.length - 1),
        });
      }, sentenceShowTime);
      return;
    }

    setTimeout(
      () => {
        setShowing({
          idx: showing.idx,
          direction: showing.direction,
          text: list[showing.idx].substring(
            0,
            showing.text.length + showing.direction
          ),
        });
      },
      showing.direction === 1 ? typingDelay : backspaceDelay
    );
  }, [
    list,
    sentenceDelay,
    typingDelay,
    sentenceShowTime,
    backspaceDelay,
    showing.direction,
    showing.idx,
    showing.text.length,
  ]);

  useEffect(() => {
    setTimeout(render, 0);
  }, [render]);

  return (
    <Container>
      {showing.text}
      <BlinkCursor
        blink={showing.text.length === props.list[showing.idx].length}
      >
        |
      </BlinkCursor>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: flex-start;
`;

const BlinkCursor = styled.span<{ blink: boolean }>`
  animation: ${(p) => (p.blink ? 'blinker .8s step-start infinite' : 'none')};
  @keyframes blinker {
    50% {
      opacity: 0;
    }
  }
`;

export default Typing;
