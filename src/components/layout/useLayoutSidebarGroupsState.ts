import { useCallback, useState } from "react";
import Cookies from "js-cookie";
import { createSlug } from "@/utils/slugify";

const SIDEBAR_GROUPS_COOKIE = "sidebar_groups_state";
const SIDEBAR_GROUPS_COOKIE_DAYS_TO_EXPIRE = 7;

/**
 * Defines the shape of the state object that stores the open/closed status
 * of sidebar navigation groups. It's a dictionary where keys are generated
 * path strings (from `generateGroupPathKey`) and values are booleans (true for open, false for closed).
 */
interface GroupStates {
  [key: string]: boolean;
}

/**
 * Custom React hook to manage the open/closed state of collapsible sidebar navigation groups.
 *
 * This hook persists the state of sidebar groups (identified by their path of labels)
 * to a browser cookie (`sidebar_groups_state`). When initialized, it attempts to load the
 * state from this cookie. If the cookie is not present or contains invalid data,
 * it defaults to an empty state (meaning groups will default to open until interacted with).
 *
 * @returns An object containing two memoized callback functions:
 *  - `isGroupOpen(groupPathElements: string[]): boolean`:
 *    Checks if a specific group (identified by its path of labels) is currently marked as open.
 *    Defaults to `true` (open) if the group's state hasn't been explicitly saved yet.
 *  - `toggleGroup(groupPathElements: string[], isOpen: boolean): void`:
 *    Updates the open/closed state of a specific group and persists this change to the cookie.
 */
export function useLayoutSidebarGroupsState() {
  const [groupStates, setGroupStates] = useState<GroupStates>(() => {
    try {
      const saved = Cookies.get(SIDEBAR_GROUPS_COOKIE);
      return saved ? JSON.parse(saved) : {};
    } catch {
      // If cookie parsing fails, default to an empty state.
      return {};
    }
  });

  const isGroupOpen = useCallback(
    (groupPathElements: string[]): boolean => {
      const key = createSlug(groupPathElements.join('-'));
      const isOpen = groupStates[key] ?? true;
      return isOpen;
    },
    [groupStates],
  );

  const toggleGroup = useCallback(
    (groupPathElements: string[], isOpen: boolean) => {
      const key = createSlug(groupPathElements.join('-'));
      setGroupStates((prev: GroupStates) => {
        const next = { ...prev, [key]: isOpen };
        Cookies.set(SIDEBAR_GROUPS_COOKIE, JSON.stringify(next), {
          expires: SIDEBAR_GROUPS_COOKIE_DAYS_TO_EXPIRE,
        });
        return next;
      });
    },
    [],
  );

  return {
    isGroupOpen,
    toggleGroup,
  };
}