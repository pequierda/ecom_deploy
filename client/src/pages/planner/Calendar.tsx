// pages/planner/Calendar.tsx
import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, MapPin, User, Filter } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const PlannerCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const events = [
    {
      id: 1,
      title: 'Sarah & Miguel Wedding',
      type: 'wedding',
      date: '2025-01-20',
      time: '10:00 AM',
      duration: '8 hours',
      venue: 'Garden Paradise Resort, Tagaytay',
      client: 'Sarah & Miguel Rodriguez',
      status: 'confirmed',
      color: 'bg-pink-500'
    },
    {
      id: 2,
      title: 'Site Visit - Botanical Garden',
      type: 'meeting',
      date: '2025-01-15',
      time: '2:00 PM',
      duration: '2 hours',
      venue: 'Botanical Garden, Antipolo',
      client: 'Maria & Carlos Santos',
      status: 'scheduled',
      color: 'bg-blue-500'
    },
    {
      id: 3,
      title: 'Final Planning Meeting',
      type: 'meeting',
      date: '2025-01-18',
      time: '3:00 PM',
      duration: '1 hour',
      venue: 'Office',
      client: 'Anna & David Kim',
      status: 'scheduled',
      color: 'bg-green-500'
    },
    {
      id: 4,
      title: 'Venue Setup',
      type: 'setup',
      date: '2025-01-25',
      time: '8:00 AM',
      duration: '4 hours',
      venue: 'Seaside Chapel, Bataan',
      client: 'Anna & David Kim',
      status: 'confirmed',
      color: 'bg-purple-500'
    },
    {
      id: 5,
      title: 'Client Consultation',
      type: 'consultation',
      date: '2025-01-22',
      time: '11:00 AM',
      duration: '1.5 hours',
      venue: 'Office',
      client: 'Lisa & Mark Gonzalez',
      status: 'scheduled',
      color: 'bg-orange-500'
    }
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const today = new Date();
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const renderCalendarGrid = () => {
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-32 border border-gray-200 bg-gray-50"></div>
      );
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = date.toDateString() === today.toDateString();
      const dayEvents = getEventsForDate(date);
      
      days.push(
        <div
          key={day}
          className={`h-32 border border-gray-200 bg-white p-2 cursor-pointer hover:bg-gray-50 ${
            isToday ? 'bg-pink-50 border-pink-200' : ''
          }`}
          onClick={() => setSelectedDate(date)}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-pink-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className={`${event.color} text-white text-xs p-1 rounded truncate`}
                title={event.title}
              >
                {event.time} - {event.title}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-500">
                +{dayEvents.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'wedding': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'meeting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'setup': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'consultation': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <DashboardLayout 
      title="Calendar"
      subtitle="Manage your wedding events and appointments"
    >
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <h2 className="text-xl font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['month', 'week', 'day'].map((viewType) => (
              <button
                key={viewType}
                onClick={() => setView(viewType as 'month' | 'week' | 'day')}
                className={`px-3 py-1 text-sm font-medium rounded-md capitalize transition-colors ${
                  view === viewType
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {viewType}
              </button>
            ))}
          </div>
          
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 bg-gray-50">
              {dayNames.map((day) => (
                <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {renderCalendarGrid()}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Mini Calendar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Quick Navigation</h3>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="w-full px-3 py-2 text-sm bg-pink-100 text-pink-700 rounded-md hover:bg-pink-200 transition-colors"
            >
              Go to Today
            </button>
          </div>

          {/* Event Legend */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Event Types</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-pink-500 rounded"></div>
                <span className="text-sm text-gray-600">Weddings</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600">Client Meetings</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Planning Sessions</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span className="text-sm text-gray-600">Setup & Prep</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span className="text-sm text-gray-600">Consultations</span>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Upcoming Events</h3>
            <div className="space-y-3">
              {events
                .filter(event => new Date(event.date) >= today)
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map((event) => (
                  <div key={event.id} className="border-l-4 pl-3 py-2" style={{ borderLeftColor: event.color.replace('bg-', '#').replace('-500', '') }}>
                    <div className="text-sm font-medium text-gray-900">{event.title}</div>
                    <div className="text-xs text-gray-600 flex items-center mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {event.time}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {event.client}
                    </div>
                  </div>
                ))}
            </div>
            {events.filter(event => new Date(event.date) >= today).length === 0 && (
              <p className="text-sm text-gray-500">No upcoming events</p>
            )}
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Events for {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                {getEventsForDate(selectedDate).map((event) => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getEventTypeColor(event.type)}`}>
                        {event.type}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{event.time} ({event.duration})</span>
                      </div>
                      
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{event.venue}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{event.client}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex space-x-2">
                      <button className="px-3 py-1 text-xs bg-pink-100 text-pink-700 rounded hover:bg-pink-200">
                        Edit
                      </button>
                      <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                        Reschedule
                      </button>
                    </div>
                  </div>
                ))}
                
                {getEventsForDate(selectedDate).length === 0 && (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No events scheduled for this date</p>
                    <button className="mt-2 px-4 py-2 bg-pink-600 text-white text-sm rounded-md hover:bg-pink-700">
                      Add Event
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PlannerCalendar;