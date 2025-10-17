import { PlusIcon } from "@phosphor-icons/react";
import type { ResumeDto } from "@reactive-resume/dto";
import { KeyboardShortcut } from "@reactive-resume/ui";

import { useDialog } from "@/client/stores/dialog";

import { BaseListItem } from "./base-item";

export const CreateResumeListItem = () => {
  const { open } = useDialog<ResumeDto>("resume");

  return (
    <BaseListItem
      start={<PlusIcon size={18} />}
      title={
        <>
          <span>{`Create a new resume`}</span>
          <KeyboardShortcut className="ml-2">^N</KeyboardShortcut>
        </>
      }
      description={`Start building from scratch`}
      onClick={() => {
        open("create");
      }}
    />
  );
};
