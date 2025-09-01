import { type JSX } from "react";
import BaseButton from "./base/BaseButton.tsx";
import "./VoiceButton.css";
import { mdiMicrophone, mdiRecordCircleOutline } from "@mdi/js";
import Icon from "@mdi/react";
import classNames from "classnames";

type Props = {
  disabled?: boolean;
  isRecording?: boolean;
  recordingElapsedTime: string;

  onClick?: () => void;
};

function VoiceButton({
  isRecording,

  onClick,
}: Props): JSX.Element {
  const classes = classNames("recording-button", {
    recording: isRecording,
  });

  return (
    <div>
      <BaseButton
        type="button"
        onClick={onClick}
        className={classes}
        icon={
          <Icon
            path={isRecording ? mdiRecordCircleOutline : mdiMicrophone}
            size={1}
          />
        }
      />
    </div>
  );
}

export default VoiceButton;
