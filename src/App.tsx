import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  MouseSensor,
  useSensor,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronsUpDown } from "lucide-react";
import { memo, useState } from "react";
import "./App.css";
import { Button } from "./components/ui/button";

type Column = {
  id: string;
  name: string;
};

const columns: Array<Column> = [
  {
    id: "1",
    name: "Name 1",
  },
  {
    id: "2",
    name: "Name 2",
  },
  {
    id: "3",
    name: "Name 3",
  },
  {
    id: "4",
    name: "Name 4",
  },
  {
    id: "5",
    name: "Name 5",
  },
];

const Item = memo(
  ({
    changeName,
    option,
    index,
  }: {
    option: { id: string; name: string | null };
    changeName: (index: number, value: string) => void;
    index: number;
  }) => {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<string | null>(option.name);
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({
        id: option.id,
        transition: {
          duration: 150,
          easing: "cubic-bezier(0.25, 1, 0.5, 1)",
        },
      });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div {...attributes} {...listeners} ref={setNodeRef} style={style}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[200px] justify-between"
            >
              {selected ? selected : "Open"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search framework..." />
              <CommandList>
                <CommandEmpty>No framework found.</CommandEmpty>
                <CommandGroup>
                  {columns.map(({ id, name }) => (
                    <CommandItem
                      key={id}
                      value={name}
                      onSelect={(currentValue) => {
                        changeName(index, currentValue);
                        setOpen(false);
                        setSelected(currentValue);
                      }}
                    >
                      {name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

const max = 50;

function App() {
  const [options, setOptions] = useState<
    Array<{ id: string; name: string | null }>
  >([
    { id: "1", name: null },
    { id: "2", name: null },
    { id: "3", name: null },
  ]);
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });

  const findFieldsIndexes = ({
    fieldToMoveId,
    targetFieldId,
  }: {
    fieldToMoveId: string;
    targetFieldId: string;
  }) => {
    const fieldToMoveIndex = options.findIndex(
      ({ id }) => id === fieldToMoveId
    );
    const targetFieldIndex = options.findIndex(
      ({ id }) => id === targetFieldId
    );

    return { fieldToMoveIndex, targetFieldIndex };
  };

  const handleReOrder = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id === over.id) return;

    const { fieldToMoveIndex, targetFieldIndex } = findFieldsIndexes({
      fieldToMoveId: `${active.id}`,
      targetFieldId: `${over.id}`,
    });

    setOptions(arrayMove(options, fieldToMoveIndex, targetFieldIndex));
  };

  const changeName = (index: number, value: string) => {
    setOptions((prev) => {
      const newOptions = [...prev];
      newOptions[index] = { ...newOptions[index], name: value };

      return newOptions;
    });
  };

  return (
    <section className="grid gap-10">
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleReOrder}
        sensors={[mouseSensor]}
      >
        <SortableContext items={options} strategy={verticalListSortingStrategy}>
          <article className="grid gap-4 py-4 h-48 overflow-scroll">
            {options.map((option, index) => (
              <Item
                changeName={changeName}
                index={index}
                key={option.id}
                option={option}
              />
            ))}
          </article>
        </SortableContext>
      </DndContext>

      <footer>
        <Button
          disabled={options.length === max}
          onClick={() => {
            setOptions((prevOptions) => {
              const currentLength = prevOptions.length;

              if (currentLength === max) return prevOptions;

              return [
                ...prevOptions,
                { id: `${currentLength + 1}`, name: null },
              ];
            });
          }}
        >
          Add Option
        </Button>
      </footer>
    </section>
  );
}

export default App;
