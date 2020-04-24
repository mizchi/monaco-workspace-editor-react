import { useDrag, useDrop, DragSourceMonitor } from "react-dnd";
import {
  ElementData,
  GridAreaData,
  DragType,
  DropType,
  ElementTree,
  SourceDragType,
  ElementNode,
  GridData,
} from "../types";
import { useTreeDispatch } from "./tree";
import { swapNodes, moveNode, addChild } from "../reducer";
import { ulid } from "ulid";
import { uniqueId } from "lodash-es";
// import { ElementData, TreeNode } from "./types";

export const DND_CONTEXT = "dnd-context";

type DragSpec<T> = {
  canDrag?: () => boolean;
  collect?: (monitor: DragSourceMonitor) => T;
};

type DragState = {
  isDragging: boolean;
};

type DropState = {
  canDrop: boolean;
  isOver: boolean;
};

export function useDragOnTree(dragType: DragType) {
  return useDrag<DragType & { type: typeof DND_CONTEXT }, void, DragState>({
    canDrag: () => {
      return true;
    },
    begin() {
      console.log("begin", dragType);
    },
    item: {
      type: DND_CONTEXT,
      ...dragType,
    },
    collect(monitor: DragSourceMonitor) {
      return {
        isDragging: monitor.isDragging(),
      };
    },
  });
}

export function useDropOnTree(drop: DropType) {
  const dispatch = useTreeDispatch();
  return useDrop<DragType & { type: typeof DND_CONTEXT }, any, DropState>({
    accept: DND_CONTEXT,
    canDrop: () => true,
    collect(monitor) {
      return {
        canDrop: monitor.canDrop(),
        isOver: monitor.isOver(),
      };
    },
    drop(drag, _monitor) {
      console.log("drag", drag, ": drop to", drop);
      switch (drag.dragType) {
        case "source": {
          switch (drop.dropType) {
            case "blank": {
              const {
                data: childData,
                children,
              } = createElementDataBySourceType(drag);
              dispatch(
                addChild({ parentId: drop.parentId, data: childData, children })
              );
              return;
            }
            default: {
              return;
            }
          }
        }
        case "element": {
          switch (drop.dropType) {
            case "blank": {
              dispatch(
                moveNode({
                  targetId: drag.id,
                  newParentId: drop.parentId,
                })
              );
              return;
            }
            case "existed-element": {
              dispatch(swapNodes({ aid: drag.id, bid: drop.id }));
              return;
            }
            default: {
              return;
            }
          }
        }
      }
    },
  });
}

function createElementDataBySourceType(
  drag: SourceDragType
): {
  data: ElementData;
  children: ElementTree[];
} {
  switch (drag.source.sourceType) {
    case "text": {
      return {
        data: {
          elementType: "text",
          value: ulid().slice(-5),
        },
        children: [],
      };
    }

    case "image": {
      return {
        data: {
          elementType: "image",
          src: drag.source.src,
        },
        children: [],
      };
    }

    case "flex": {
      return {
        data: {
          elementType: "flex",
          direction: drag.source.direction,
        },
        children: [],
      };
    }

    case "grid": {
      const childData = {
        elementType: "grid",
        rows: drag.source.rows,
        columns: drag.source.columns,
        areas: drag.source.areas,
      } as GridData;
      // @ts-ignore
      const children = drag.source.areas.flat().map((areaName: string) => {
        return {
          id: uniqueId(),
          data: {
            elementType: "grid-area",
            gridArea: areaName,
          } as GridAreaData,
          children: [],
        };
      });
      return { data: childData, children };
    }
    default: {
      // @ts-ignore
      throw new Error(`Unkown sourceType ${drag.source.sourceType}`);
    }
  }
}
