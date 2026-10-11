import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useServices } from "../../../composition/ServicesProvider";
import {
  Button,
  IconButton,
  Card,
  Label,
  ErrorMessage,
} from "../../../shared/ui/components";
import CreationModal from "../../../shared/ui/CreationModal";
import { categories, type BudgetSummary } from "../domain/budget";
import { usePreferences } from "../../settings/PreferencesProvider";
const icons = {
  tag: "\uD83C\uDFF7\uFE0F",
  paw: "\uD83D\uDC3E",
  home: "\uD83C\uDFE0",
  food: "\uD83D\uDED2",
  car: "\uD83D\uDE97",
  heart: "\u2764\uFE0F",
  book: "\uD83D\uDCDA",
  gift: "\uD83C\uDF81",
  wallet: "\uD83D\uDCBC",
  plane: "\u2708\uFE0F",
};
export default function CategoryManager({
  summary,
  reload,
}: {
  summary: BudgetSummary;
  reload(): void;
}) {
  const { budget } = useServices();
  const { t, language, colors } = usePreferences();
  const [expanded, setExpanded] = useState(false);
  const text = (fr: string, en: string) => (language === "fr" ? fr : en);
  const [editing, setEditing] = useState<{
    id: string;
    name: string;
    icon?: string;
    baseCategory?: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [localOrder, setLocalOrder] = useState<string[] | null>(null);
  const [drag, setDrag] = useState<{ id: string; offset: number } | null>(null);
  const gesture = useRef<{
    id: string;
    y: number;
    active: boolean;
    timer?: ReturnType<typeof setTimeout>;
  } | null>(null);
  useEffect(() => () => clearTimeout(gesture.current?.timer), []);
  const rows = [
    ...categories
      .filter((c) => !summary.hiddenCategories?.includes(c))
      .map((c) => ({
        id: `base:${c}`,
        name: t(c),
        icon:
          (
            {
              salaire: "wallet",
              loyer: "home",
              nourriture: "food",
              transport: "car",
              loisirs: "gift",
              "sant\u00e9": "heart",
              "\u00e9ducation": "book",
            } as Record<string, string>
          )[c] ?? "tag",
        baseCategory: c,
      })),
    ...(summary.customCategories ?? []),
  ].sort((a, b) => {
    const rank = (id: string) => {
      const index = (localOrder ?? summary.categoryOrder ?? []).indexOf(id);
      return index < 0 ? 10000 : index;
    };
    return rank(a.id) - rank(b.id);
  });
  async function move(id: string, offset: number) {
    const ids = rows.map((r) => r.id);
    const from = ids.indexOf(id);
    const to = Math.max(
      0,
      Math.min(ids.length - 1, from + Math.round(offset / 60)),
    );
    if (from === to) return;
    ids.splice(from, 1);
    ids.splice(to, 0, id);
    setLocalOrder(ids);
    setPending(true);
    try {
      await budget.reorderCategories(ids);
      setError("");
      reload();
    } catch (e) {
      setLocalOrder(null);
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  }
  async function remove(row: (typeof rows)[number]) {
    setPending(true);
    try {
      await budget.removeCategory(row.id);
      reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  }
  return (
    <Card>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={text("Cat\u00e9gories", "Categories")}
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((value) => !value)}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 44,
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <Label>
          {text("Cat\u00e9gories", "Categories")} ({rows.length})
        </Label>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={22}
          color={colors.accent}
        />
      </Pressable>
      <ErrorMessage message={error} />
      {expanded && (
        <Button
          title={text("Ajouter une categorie", "Add category")}
          icon="add-outline"
          disabled={pending}
          onPress={() => setEditing({ id: "new", name: "", icon: "tag" })}
        />
      )}
      {expanded && (
        <Label muted>
          {text(
            "Maintenez la poignee puis glissez pour deplacer.",
            "Hold the handle, then drag to reorder.",
          )}
        </Label>
      )}
      {expanded &&
        rows.map((row) => (
          <View
            key={row.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              paddingVertical: 8,
              height: 60,
              backgroundColor:
                drag?.id === row.id ? colors.accentSoft : undefined,
              transform: [
                { translateY: drag?.id === row.id ? drag.offset : 0 },
              ],
              zIndex: drag?.id === row.id ? 2 : 0,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                flex: 1,
              }}
            >
              <View
                accessible
                accessibilityRole="button"
                accessibilityLabel={text(
                  "Maintenir pour deplacer",
                  "Hold to move",
                )}
                onStartShouldSetResponder={() => !pending}
                onResponderGrant={(event) => {
                  const g = {
                    id: row.id,
                    y: event.nativeEvent.pageY,
                    active: false,
                    timer: undefined as
                      ReturnType<typeof setTimeout> | undefined,
                  };
                  gesture.current = g;
                  g.timer = setTimeout(() => {
                    g.active = true;
                    setDrag({ id: g.id, offset: 0 });
                  }, 400);
                }}
                onResponderMove={(event) => {
                  const g = gesture.current;
                  if (!g) return;
                  const offset = event.nativeEvent.pageY - g.y;
                  if (g.active) setDrag({ id: g.id, offset });
                  else if (Math.abs(offset) > 8) clearTimeout(g.timer);
                }}
                onResponderTerminationRequest={() => !gesture.current?.active}
                onResponderTerminate={() => {
                  clearTimeout(gesture.current?.timer);
                  gesture.current = null;
                  setDrag(null);
                }}
                onResponderRelease={(event) => {
                  const g = gesture.current;
                  clearTimeout(g?.timer);
                  gesture.current = null;
                  setDrag(null);
                  if (g?.active) void move(g.id, event.nativeEvent.pageY - g.y);
                }}
                style={{
                  width: 36,
                  height: 44,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="reorder-three-outline"
                  size={24}
                  color={colors.accent}
                />
              </View>
              <Label>
                {icons[row.icon as keyof typeof icons] ?? icons.tag} {row.name}
              </Label>
            </View>
            {row.baseCategory !== "autres" && (
              <View style={{ flexDirection: "row", gap: 8 }}>
                <IconButton
                  icon="create-outline"
                  label={`${text("Modifier", "Edit")} ${row.name}`}
                  disabled={pending}
                  onPress={() => setEditing(row)}
                />
                <IconButton
                  icon="trash-outline"
                  destructive
                  label={`${text("Supprimer", "Delete")} ${row.name}`}
                  disabled={pending}
                  onPress={() =>
                    Alert.alert(
                      text("Supprimer", "Delete"),
                      text(
                        "Les transactions seront conserv\u00e9es dans Autres et le budget sera retir\u00e9.",
                        "Transactions will move to Other and the budget will be removed.",
                      ),
                      [
                        { text: t("cancel"), style: "cancel" },
                        {
                          text: text("Supprimer", "Delete"),
                          style: "destructive",
                          onPress: () => void remove(row),
                        },
                      ],
                    )
                  }
                />
              </View>
            )}
          </View>
        ))}
      {editing && (
        <CreationModal
          title={text("Cat\u00e9gorie", "Category")}
          close={() => setEditing(null)}
          saved={() => {
            setEditing(null);
            reload();
          }}
          fields={[
            {
              key: "name",
              label: text("Nom", "Name"),
              initial: editing.name,
              maxLength: 100,
            },
            {
              key: "icon",
              label: text("Ic\u00f4ne", "Icon"),
              initial: editing.icon ?? "tag",
              options: Object.entries(icons).map(([value, label]) => ({
                value,
                label,
              })),
            },
          ]}
          submit={async (values) => {
            if (!values.name.trim())
              throw new Error(
                text("Le nom est obligatoire.", "Name is required."),
              );
            const body = { name: values.name.trim(), icon: values.icon };
            if (editing.id.startsWith("base:") || editing.id === "new")
              await budget.createCategory({
                ...body,
                budget: 0,
                baseCategory: editing.baseCategory,
              });
            else await budget.updateCategory(editing.id, body);
          }}
        />
      )}
    </Card>
  );
}
