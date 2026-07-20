import { nanoid } from "nanoid";

export type NodeStatus = "draft" | "complete" | "needs-review";

export interface RecommendationNode {
  id: string;
  type: "recommendation";
  title: string;
  number: string;
  status: NodeStatus;
}

export interface QuestionNode {
  id: string;
  type: "question";
  title: string;
  status: NodeStatus;
  children: RecommendationNode[];
}

export interface SectionNode {
  id: string;
  type: "section";
  title: string;
  status: NodeStatus;
  children: QuestionNode[];
}

export type AnyNode = SectionNode | QuestionNode | RecommendationNode;

export interface GuidelineTree {
  sections: SectionNode[];
}

// Find a node + its parent array + index, anywhere in the tree
export function findNodeLocation(
  tree: GuidelineTree,
  id: string
): { parentArray: AnyNode[]; index: number; node: AnyNode } | null {
  for (const section of tree.sections) {
    if (section.id === id) {
      return { parentArray: tree.sections, index: tree.sections.indexOf(section), node: section };
    }
    for (const question of section.children) {
      if (question.id === id) {
        return { parentArray: section.children, index: section.children.indexOf(question), node: question };
      }
      for (const rec of question.children) {
        if (rec.id === id) {
          return { parentArray: question.children, index: question.children.indexOf(rec), node: rec };
        }
      }
    }
  }
  return null;
}

// Move a node from one location to another, only if types match
export function moveNode(
  tree: GuidelineTree,
  activeId: string,
  overId: string
): GuidelineTree {
  const newTree: GuidelineTree = structuredClone(tree);

  const activeLoc = findNodeLocation(newTree, activeId);
  const overLoc = findNodeLocation(newTree, overId);
  if (!activeLoc || !overLoc) return tree;
  if (activeLoc.node.type !== overLoc.node.type) return tree; // block cross-type drops

  // Remove from source
  const [moved] = activeLoc.parentArray.splice(activeLoc.index, 1);

  // Recompute over's index in case source removal shifted it (same array case)
  const overArray = overLoc.parentArray;
  const overIndex = overArray.indexOf(overLoc.node as never);
  overArray.splice(overIndex, 0, moved as never);

  return newTree;
}

// --- Add child ---

export function addChild(tree: GuidelineTree, parentId: string): GuidelineTree {
  const newTree: GuidelineTree = structuredClone(tree);

  if (parentId === "root") {
    newTree.sections.push({
      id: nanoid(),
      type: "section",
      title: "New section",
      status: "draft",
      children: [],
    });
    return newTree;
  }

  const loc = findNodeLocation(newTree, parentId);
  if (!loc) return tree;

  if (loc.node.type === "section") {
    loc.node.children.push({
      id: nanoid(),
      type: "question",
      title: "New question",
      status: "draft",
      children: [],
    });
  } else if (loc.node.type === "question") {
    loc.node.children.push({
      id: nanoid(),
      type: "recommendation",
      title: "New recommendation",
      number: "",
      status: "draft",
    });
  }
  // recommendations have no children — "Add" option shouldn't appear for them

  return newTree;
}

// --- Rename ---

export function renameNode(tree: GuidelineTree, id: string, newTitle: string): GuidelineTree {
  const newTree: GuidelineTree = structuredClone(tree);
  const loc = findNodeLocation(newTree, id);
  if (!loc) return tree;
  loc.node.title = newTitle;
  return newTree;
}

// --- Duplicate ---
// Duplicates the node and its entire subtree, inserting it directly after the original

export function duplicateNode(tree: GuidelineTree, id: string): GuidelineTree {
  const newTree: GuidelineTree = structuredClone(tree);
  const loc = findNodeLocation(newTree, id);
  if (!loc) return tree;

  const clone = deepCloneWithNewIds(loc.node);
  loc.parentArray.splice(loc.index + 1, 0, clone as never);
  return newTree;
}

function deepCloneWithNewIds(node: AnyNode): AnyNode {
  const cloned = structuredClone(node);
  cloned.id = nanoid();
  cloned.title = `${cloned.title} (copy)`;
  if (cloned.type === "section" || cloned.type === "question") {
    cloned.children = cloned.children.map((child) => deepCloneWithNewIds(child) as never);
  }
  return cloned;
}

// --- Delete ---

export function deleteNode(tree: GuidelineTree, id: string): GuidelineTree {
  const newTree: GuidelineTree = structuredClone(tree);
  const loc = findNodeLocation(newTree, id);
  if (!loc) return tree;
  loc.parentArray.splice(loc.index, 1);
  return newTree;
}

// --- Move up / down (adjacent swap, keyboard-accessible fallback to drag) ---

export function moveAdjacent(tree: GuidelineTree, id: string, direction: "up" | "down"): GuidelineTree {
  const newTree: GuidelineTree = structuredClone(tree);
  const loc = findNodeLocation(newTree, id);
  if (!loc) return tree;

  const targetIndex = direction === "up" ? loc.index - 1 : loc.index + 1;
  if (targetIndex < 0 || targetIndex >= loc.parentArray.length) return tree; // no-op at boundary

  const arr = loc.parentArray;
  [arr[loc.index], arr[targetIndex]] = [arr[targetIndex], arr[loc.index]];
  return newTree;
}


export interface SectionNode {
  id: string;
  type: "section";
  title: string;
  status: NodeStatus;
  overview?: string; // HTML from Tiptap
  children: QuestionNode[];
}

export interface QuestionNode {
  id: string;
  type: "question";
  title: string;
  status: NodeStatus;
  clinicalQuestion?: string;
  background?: string; // HTML
  children: RecommendationNode[];
}

export interface RecommendationNode {
  id: string;
  type: "recommendation";
  title: string;
  number: string;
  status: NodeStatus;
  strength?: string;
  certaintyOfEvidence?: string;
  statement?: string; // HTML
}

export function updateNodeField<T extends AnyNode>(
  tree: GuidelineTree,
  id: string,
  field: string,
  value: string
): GuidelineTree {
  const newTree: GuidelineTree = structuredClone(tree);
  const loc = findNodeLocation(newTree, id);
  if (!loc) return tree;
  (loc.node as never)[field] = value;
  return newTree;
}