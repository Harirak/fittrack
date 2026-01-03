'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EquipmentToggle } from '@/components/ui/EquipmentToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { User, Dumbbell, Target, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  FITNESS_LEVEL_LABELS,
  UNIT_LABELS,
  GOAL_PERIOD_LABELS,
} from '@/lib/constants';
import type { User as UserType, EquipmentProfile, ActivityGoal } from '@/lib/db/schema';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [equipment, setEquipment] = useState<EquipmentProfile | null>(null);
  const [goals, setGoals] = useState<{
    daily: ActivityGoal | null;
    weekly: ActivityGoal | null;
  }>({ daily: null, weekly: null });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    weightKg: '',
    unitPreference: 'metric' as 'metric' | 'imperial',
    fitnessLevel: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
  });

  const [equipmentData, setEquipmentData] = useState<EquipmentProfile>({
    id: '',
    userId: '',
    dumbbells: false,
    barbells: false,
    kettlebells: false,
    bodyweight: true,
    updatedAt: new Date(),
  });

  const [goalData, setGoalData] = useState({
    daily: {
      durationMinutes: 30,
      distanceKm: 3,
      workoutCount: 1,
    },
    weekly: {
      durationMinutes: 150,
      distanceKm: 20,
      workoutCount: 4,
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [userRes, equipmentRes, goalsRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/user/equipment'),
        fetch('/api/user/goals'),
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
        setFormData({
          name: userData.name || '',
          weightKg: userData.weightKg ? String(userData.weightKg) : '',
          unitPreference: userData.unitPreference,
          fitnessLevel: userData.fitnessLevel,
        });
      }

      if (equipmentRes.ok) {
        const equipmentData = await equipmentRes.json();
        setEquipment(equipmentData);
        setEquipmentData(equipmentData);
      }

      if (goalsRes.ok) {
        const goalsData = await goalsRes.json();
        setGoals(goalsData);
        if (goalsData.daily) {
          setGoalData((prev) => ({
            ...prev,
            daily: {
              durationMinutes: goalsData.daily.durationMinutes,
              distanceKm: goalsData.daily.distanceKm,
              workoutCount: goalsData.daily.workoutCount,
            },
          }));
        }
        if (goalsData.weekly) {
          setGoalData((prev) => ({
            ...prev,
            weekly: {
              durationMinutes: goalsData.weekly.durationMinutes,
              distanceKm: goalsData.weekly.distanceKm,
              workoutCount: goalsData.weekly.workoutCount,
            },
          }));
        }
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name || undefined,
          weightKg: formData.weightKg ? parseFloat(formData.weightKg) : null,
          unitPreference: formData.unitPreference,
          fitnessLevel: formData.fitnessLevel,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update profile');
      }

      const updated = await res.json();
      setUser(updated);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEquipment = async () => {
    try {
      setIsSaving(true);
      const res = await fetch('/api/user/equipment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(equipmentData),
      });

      if (!res.ok) {
        throw new Error('Failed to update equipment');
      }

      const updated = await res.json();
      setEquipment(updated);
      toast.success('Equipment updated successfully');
    } catch (error) {
      console.error('Error saving equipment:', error);
      toast.error('Failed to update equipment');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveGoals = async () => {
    try {
      setIsSaving(true);
      const res = await fetch('/api/user/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData),
      });

      if (!res.ok) {
        throw new Error('Failed to update goals');
      }

      const updated = await res.json();
      setGoals(updated);
      toast.success('Goals updated successfully');
    } catch (error) {
      console.error('Error saving goals:', error);
      toast.error('Failed to update goals');
    } finally {
      setIsSaving(false);
    }
  };

  const getWeightLabel = () => {
    return formData.unitPreference === 'metric' ? 'Weight (kg)' : 'Weight (lb)';
  };

  const getWeightDisplay = (kg: number) => {
    if (formData.unitPreference === 'metric') {
      return `${kg} kg`;
    }
    return `${Math.round(kg * 2.20462)} lb`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Profile & Settings</h1>
        <p className="text-zinc-400">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-zinc-900">
          <TabsTrigger value="profile" className="data-[state=active]:bg-purple-500/20">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="equipment" className="data-[state=active]:bg-purple-500/20">
            <Dumbbell className="mr-2 h-4 w-4" />
            Equipment
          </TabsTrigger>
          <TabsTrigger value="goals" className="data-[state=active]:bg-purple-500/20">
            <Target className="mr-2 h-4 w-4" />
            Goals
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-white">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Email
                </label>
                <Input
                  type="email"
                  value={user?.email ?? ''}
                  disabled
                  className="border-zinc-800 bg-zinc-950 text-zinc-500"
                />
                <p className="mt-1 text-xs text-zinc-500">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Name
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                  className="border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    {getWeightLabel()}
                  </label>
                  <Input
                    type="number"
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                    placeholder={formData.unitPreference === 'metric' ? '70' : '154'}
                    className="border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Unit Preference
                  </label>
                  <select
                    value={formData.unitPreference}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        unitPreference: e.target.value as 'metric' | 'imperial',
                      })
                    }
                    className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-white"
                  >
                    <option value="metric">Metric (kg, km)</option>
                    <option value="imperial">Imperial (lb, mi)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Fitness Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData({ ...formData, fitnessLevel: level })}
                      className={cn(
                        'rounded-lg border-2 p-3 text-center transition-all',
                        formData.fitnessLevel === level
                          ? 'border-purple-500 bg-purple-500/10 text-white'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                      )}
                    >
                      {FITNESS_LEVEL_LABELS[level]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Equipment Tab */}
        <TabsContent value="equipment" className="space-y-4">
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-white">Your Equipment</CardTitle>
              <p className="text-sm text-zinc-400">
                Select all the equipment you have access to. This will be used to filter exercises and
                generate workout plans.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <EquipmentToggle
                profile={equipmentData}
                onChange={(key, value) => {
                  setEquipmentData((prev) => ({ ...prev, [key]: value }));
                }}
              />

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveEquipment}
                  disabled={isSaving}
                  className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Current Equipment Summary */}
          {equipment && (
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-white">Current Selection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {equipment.dumbbells && (
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                      Dumbbells
                    </Badge>
                  )}
                  {equipment.barbells && (
                    <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/50">
                      Barbells
                    </Badge>
                  )}
                  {equipment.kettlebells && (
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
                      Kettlebells
                    </Badge>
                  )}
                  {equipment.bodyweight && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                      Bodyweight
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-white">Activity Goals</CardTitle>
              <p className="text-sm text-zinc-400">
                Set your daily and weekly fitness targets to track your progress.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Daily Goals */}
              <div>
                <h3 className="mb-4 font-medium text-white">Daily Goals</h3>
                <div className="grid gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      Duration (minutes)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="1440"
                      value={goalData.daily.durationMinutes}
                      onChange={(e) =>
                        setGoalData({
                          ...goalData,
                          daily: {
                            ...goalData.daily,
                            durationMinutes: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="border-zinc-800 bg-zinc-950 text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      Distance ({formData.unitPreference === 'metric' ? 'km' : 'mi'})
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={goalData.daily.distanceKm}
                      onChange={(e) =>
                        setGoalData({
                          ...goalData,
                          daily: {
                            ...goalData.daily,
                            distanceKm: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="border-zinc-800 bg-zinc-950 text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      Workouts per day
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={goalData.daily.workoutCount}
                      onChange={(e) =>
                        setGoalData({
                          ...goalData,
                          daily: {
                            ...goalData.daily,
                            workoutCount: parseInt(e.target.value) || 1,
                          },
                        })
                      }
                      className="border-zinc-800 bg-zinc-950 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="h-px border-zinc-800" />

              {/* Weekly Goals */}
              <div>
                <h3 className="mb-4 font-medium text-white">Weekly Goals</h3>
                <div className="grid gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      Duration (minutes)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="10080"
                      value={goalData.weekly.durationMinutes}
                      onChange={(e) =>
                        setGoalData({
                          ...goalData,
                          weekly: {
                            ...goalData.weekly,
                            durationMinutes: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="border-zinc-800 bg-zinc-950 text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      Distance ({formData.unitPreference === 'metric' ? 'km' : 'mi'})
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={goalData.weekly.distanceKm}
                      onChange={(e) =>
                        setGoalData({
                          ...goalData,
                          weekly: {
                            ...goalData.weekly,
                            distanceKm: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="border-zinc-800 bg-zinc-950 text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      Workouts per week
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      value={goalData.weekly.workoutCount}
                      onChange={(e) =>
                        setGoalData({
                          ...goalData,
                          weekly: {
                            ...goalData.weekly,
                            workoutCount: parseInt(e.target.value) || 1,
                          },
                        })
                      }
                      className="border-zinc-800 bg-zinc-950 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveGoals}
                  disabled={isSaving}
                  className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
