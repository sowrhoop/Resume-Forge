import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { KeyboardShortcut } from "@reactive-resume/ui";

import { useDialog } from "@/client/stores/dialog";

import { BaseListItem } from "./base-item";

export const ImportResumeListItem = () => {
  const { open } = useDialog("import");

  return (
    <BaseListItem
      start={<DownloadSimpleIcon size={18} />}
      title={
        <>
          <span>{`Import an existing resume`}</span>
          <KeyboardShortcut className="ml-2">^I</KeyboardShortcut>
        </>
      }
      description={`LinkedIn, JSON Resume, etc.`}
      onClick={() => {
        open("create");
      }}
    />
  );
};
