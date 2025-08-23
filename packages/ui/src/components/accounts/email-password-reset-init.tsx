import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod/v4';

import { EmailPasswordResetInitOutput } from '@brainbox/core';
import { Button } from '@brainbox/ui/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@brainbox/ui/components/ui/form';
import { Input } from '@brainbox/ui/components/ui/input';
import { Label } from '@brainbox/ui/components/ui/label';
import { Spinner } from '@brainbox/ui/components/ui/spinner';
import { getServerDomain } from '@brainbox/ui/lib/server-config';
import { useMutation } from '@brainbox/ui/hooks/use-mutation';

const formSchema = z.object({
  email: z.string().min(2).email(),
});

interface EmailPasswordResetInitProps {
  onSuccess: (output: EmailPasswordResetInitOutput) => void;
  onBack: () => void;
}

export const EmailPasswordResetInit = ({
  onSuccess,
  onBack,
}: EmailPasswordResetInitProps) => {
  const { mutate, isPending } = useMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    mutate({
      input: {
        type: 'email.password.reset.init',
        email: values.email,
        server: getServerDomain(),
      },
      onSuccess(output) {
        onSuccess(output);
      },
      onError(error) {
        toast.error(error.message);
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="email">Email</Label>
              <FormControl>
                <Input placeholder="hi@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          variant="outline"
          className="w-full"
          disabled={isPending}
        >
          {isPending ? (
            <Spinner className="mr-1 size-4" />
          ) : (
            <Mail className="mr-1 size-4" />
          )}
          Reset password
        </Button>
        <Button
          variant="link"
          className="w-full text-muted-foreground"
          onClick={onBack}
          type="button"
        >
          Back to login
        </Button>
      </form>
    </Form>
  );
};
