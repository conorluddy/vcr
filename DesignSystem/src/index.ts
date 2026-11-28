// Public API: one line per component and its contract, grouped as the artifact shows them.
import "./styles/reset.css";

// === ACTIONS ===
export { Button } from "./actions/Button/Button";
export type { ButtonProps, ButtonVariant } from "./actions/Button/Button.types";
export { IconButton } from "./actions/IconButton/IconButton";
export type { IconButtonProps } from "./actions/IconButton/IconButton.types";

// === DISPLAY ===
export { GroupHeader } from "./display/GroupHeader/GroupHeader";
export type { GroupHeaderProps } from "./display/GroupHeader/GroupHeader.types";
export { Kbd } from "./display/Kbd/Kbd";
export type { KbdProps } from "./display/Kbd/Kbd.types";
export { Progress } from "./display/Progress/Progress";
export type { ProgressProps } from "./display/Progress/Progress.types";
export { Readout } from "./display/Readout/Readout";
export type { ReadoutProps } from "./display/Readout/Readout.types";
export { SignalMark } from "./display/SignalMark/SignalMark";
export type { SignalMarkProps, SignalShape, SignalTone } from "./display/SignalMark/SignalMark.types";
export { Tag } from "./display/Tag/Tag";
export type { TagProps, TagVariant } from "./display/Tag/Tag.types";

// === INPUTS ===
export { Checkbox } from "./inputs/Checkbox/Checkbox";
export type { CheckboxProps } from "./inputs/Checkbox/Checkbox.types";
export { Chip } from "./inputs/Chip/Chip";
export type { ChipProps } from "./inputs/Chip/Chip.types";
export { ChoiceGrid } from "./inputs/ChoiceGrid/ChoiceGrid";
export type { ChoiceGridProps } from "./inputs/ChoiceGrid/ChoiceGrid.types";
export { ChoiceTile } from "./inputs/ChoiceTile/ChoiceTile";
export type { ChoiceTileProps } from "./inputs/ChoiceTile/ChoiceTile.types";
export { ColorField } from "./inputs/ColorField/ColorField";
export type { ColorFieldProps } from "./inputs/ColorField/ColorField.types";
export { Field } from "./inputs/Field/Field";
export type { FieldProps } from "./inputs/Field/Field.types";
export { RulerSlider } from "./inputs/RulerSlider/RulerSlider";
export type { RulerSliderProps } from "./inputs/RulerSlider/RulerSlider.types";
export { SearchField } from "./inputs/SearchField/SearchField";
export type { SearchFieldProps } from "./inputs/SearchField/SearchField.types";
export { Segmented } from "./inputs/Segmented/Segmented";
export type { SegmentedOption, SegmentedProps } from "./inputs/Segmented/Segmented.types";
export { Select } from "./inputs/Select/Select";
export type { SelectProps } from "./inputs/Select/Select.types";
export { Switch } from "./inputs/Switch/Switch";
export type { SwitchProps } from "./inputs/Switch/Switch.types";
export { Textarea } from "./inputs/Textarea/Textarea";
export type { TextareaProps } from "./inputs/Textarea/Textarea.types";

// === REVIEW ===
export { CropThumb } from "./review/CropThumb/CropThumb";
export type { CropThumbProps } from "./review/CropThumb/CropThumb.types";
export { JudgmentRow } from "./review/JudgmentRow/JudgmentRow";
export type { JudgmentRowProps } from "./review/JudgmentRow/JudgmentRow.types";
export { describePolarity } from "./review/PolarityTag/describePolarity";
export { PolarityTag } from "./review/PolarityTag/PolarityTag";
export type {
  Polarity,
  PolarityGlyph,
  PolarityTagProps,
  PolarityUse,
} from "./review/PolarityTag/PolarityTag.types";
export { RegionOutline } from "./review/RegionOutline/RegionOutline";
export type { RegionOutlineProps, RegionState } from "./review/RegionOutline/RegionOutline.types";
export { RATING_MEANINGS, type Rating } from "./review/rating.types";
export { StarRating } from "./review/StarRating/StarRating";
export type { StarRatingDensity, StarRatingProps } from "./review/StarRating/StarRating.types";
export { VariantTile } from "./review/VariantTile/VariantTile";
export type { VariantState, VariantTileProps } from "./review/VariantTile/VariantTile.types";
// === SHARED ===
export type { ControlSize } from "./shared/controlSize.types";
// === SURFACES ===
export { FaultCard } from "./surfaces/FaultCard/FaultCard";
export type { FaultCardProps } from "./surfaces/FaultCard/FaultCard.types";
export { GlassPanel } from "./surfaces/GlassPanel/GlassPanel";
export type { GlassElevation, GlassLevel, GlassPanelProps } from "./surfaces/GlassPanel/GlassPanel.types";
export { ModeBar } from "./surfaces/ModeBar/ModeBar";
export type { ModeBarProps } from "./surfaces/ModeBar/ModeBar.types";
export { StatusMessage } from "./surfaces/StatusMessage/StatusMessage";
export type { StatusMessageProps } from "./surfaces/StatusMessage/StatusMessage.types";
