import {
  CopySimpleIcon,
  DotsThreeVerticalIcon,
  FolderOpenIcon,
  LockIcon,
  LockOpenIcon,
  PencilSimpleIcon,
  TrashSimpleIcon,
} from "@phosphor-icons/react";
import type { ResumeDto } from "@reactive-resume/dto";
import {
  Button,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@reactive-resume/ui";
import dayjs from "dayjs";
import { useNavigate } from "react-router";

import { useDialog } from "@/client/stores/dialog";

import { BaseListItem } from "./base-item";

type Props = {
  resume: ResumeDto;
};

export const ResumeListItem = ({ resume }: Props) => {
  const navigate = useNavigate();
  const { open } = useDialog<ResumeDto>("resume");
  const { open: lockOpen } = useDialog<ResumeDto>("lock");

  const lastUpdated = dayjs().to(resume.updatedAt);

  const onOpen = () => {
    void navigate(`/builder/${resume.id}`);
  };

  const onUpdate = () => {
    open("update", { id: "resume", item: resume });
  };

  const onDuplicate = () => {
    open("duplicate", { id: "resume", item: resume });
  };

  const onLockChange = () => {
    lockOpen(resume.locked ? "update" : "create", { id: "lock", item: resume });
  };

  const onDelete = () => {
    open("delete", { id: "resume", item: resume });
  };

  const dropdownMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="aspect-square">
        <Button size="icon" variant="ghost">
          <DotsThreeVerticalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={(event) => {
            event.stopPropagation();
            onOpen();
          }}
        >
          <FolderOpenIcon size={14} className="mr-2" />
          {`Open`}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(event) => {
            event.stopPropagation();
            onUpdate();
          }}
        >
          <PencilSimpleIcon size={14} className="mr-2" />
          {`Rename`}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(event) => {
            event.stopPropagation();
            onDuplicate();
          }}
        >
          <CopySimpleIcon size={14} className="mr-2" />
          {`Duplicate`}
        </DropdownMenuItem>
        {resume.locked ? (
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              onLockChange();
            }}
          >
            <LockOpenIcon size={14} className="mr-2" />
            {`Unlock`}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              onLockChange();
            }}
          >
            <LockIcon size={14} className="mr-2" />
            {`Lock`}
          </DropdownMenuItem>
        )}
        <ContextMenuSeparator />
        <DropdownMenuItem
          className="text-error"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
        >
          <TrashSimpleIcon size={14} className="mr-2" />
          {`Delete`}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger className="even:bg-secondary/20">
        <BaseListItem
          className="group"
          title={resume.title}
          description={`Last updated ${lastUpdated}`}
          end={dropdownMenu}
          onClick={onOpen}
        />
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem onClick={onOpen}>
          <FolderOpenIcon size={14} className="mr-2" />
          {`Open`}
        </ContextMenuItem>
        <ContextMenuItem onClick={onUpdate}>
          <PencilSimpleIcon size={14} className="mr-2" />
          {`Rename`}
        </ContextMenuItem>
        <ContextMenuItem onClick={onDuplicate}>
          <CopySimpleIcon size={14} className="mr-2" />
          {`Duplicate`}
        </ContextMenuItem>
        {resume.locked ? (
          <ContextMenuItem onClick={onLockChange}>
            <LockOpenIcon size={14} className="mr-2" />
            {`Unlock`}
          </ContextMenuItem>
        ) : (
          <ContextMenuItem onClick={onLockChange}>
            <LockIcon size={14} className="mr-2" />
            {`Lock`}
          </ContextMenuItem>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem className="text-error" onClick={onDelete}>
          <TrashSimpleIcon size={14} className="mr-2" />
          {`Delete`}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
