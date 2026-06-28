
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface DateRangeFilterProps {
  onDateRangeChange: (range: { from: Date; to: Date }) => void;
}

const DateRangeFilter = ({ onDateRangeChange }: DateRangeFilterProps) => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  });
  const [isOpen, setIsOpen] = useState(false);

  const handleDateSelect = (selectedDate: DateRange | undefined) => {
    setDate(selectedDate);
    if (selectedDate?.from && selectedDate?.to) {
      onDateRangeChange({
        from: selectedDate.from,
        to: selectedDate.to
      });
    }
  };

  const presetRanges = [
    {
      label: 'Last 7 days',
      getValue: () => ({
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        to: new Date()
      })
    },
    {
      label: 'Last 30 days',
      getValue: () => ({
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: new Date()
      })
    },
    {
      label: 'Last 90 days',
      getValue: () => ({
        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        to: new Date()
      })
    },
    {
      label: 'This year',
      getValue: () => ({
        from: new Date(new Date().getFullYear(), 0, 1),
        to: new Date()
      })
    }
  ];

  const handlePresetSelect = (preset: any) => {
    const range = preset.getValue();
    setDate(range);
    onDateRangeChange(range);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-auto justify-start text-left font-normal bg-white/5 border-white/10 text-white hover:bg-white/10"
        >
          <Filter className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
              </>
            ) : (
              format(date.from, 'LLL dd, y')
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-700" align="start">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex"
        >
          <div className="p-3 border-r border-gray-700">
            <div className="space-y-2">
              <p className="text-sm font-medium text-white mb-3">Quick Select</p>
              {presetRanges.map((preset, index) => (
                <motion.button
                  key={preset.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handlePresetSelect(preset)}
                  className="block w-full text-left px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                >
                  {preset.label}
                </motion.button>
              ))}
            </div>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateSelect}
            numberOfMonths={2}
            className="text-white"
          />
        </motion.div>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangeFilter;
